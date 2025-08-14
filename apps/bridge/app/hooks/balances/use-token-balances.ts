import { Address, erc20Abi, formatUnits } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

import { useGetTokenPrice } from '@/service/hooks/use-prices';
import { isEth } from '@/utils/tokens/is-eth';

import { useDestinationTokens, useSelectedTokens } from '../tokens/use-token';
import { useFromChain } from '../use-chains';
import { useGasBalance } from './use-gas-balance';

export function useTokenBalances(type: 'from' | 'to' = 'from') {
    const from = useFromChain();
    const chainId = Number(from?.chainId);
    const account = useAccount();
    const gasBalance = useGasBalance(chainId);
    const getTokenPrice = useGetTokenPrice();

    const fromTokens = useSelectedTokens();
    const toTokens = useDestinationTokens();
    const tokens = type === 'from' ? fromTokens : toTokens;

    const reads = useReadContracts({
        allowFailure: true,
        contracts: tokens?.map((t) => ({
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [account.address ?? '0x'],
            chainId: chainId,
            address: t.address as Address,
        })),
        query: {
            enabled: !!account.address,
        },
    });

    const data = tokens
        ?.map((token, index) => {
            let balance = BigInt(0);

            if (chainId && token && isEth(token)) {
                balance = gasBalance.data ?? BigInt(0);
            } else if (reads.data?.[index].result) {
                balance = BigInt(reads.data[index].result!);
            }
            const price: number = getTokenPrice(token) ?? 0;
            const usdValue = parseFloat(formatUnits(balance, Object.values(token)[0]?.decimals ?? 18)) * price;

            return {
                token,
                balance,
                usdValue,
            };
        })
        .sort((a: any, b: any) => {
            if (b.usdValue && a.usdValue) {
                return b.usdValue - a.usdValue;
            }

            return parseFloat(b.balance.toString()) - parseFloat(a.balance.toString());
        });

    return {
        isLoading: reads.isFetching,
        isError: reads.isError,
        data,
        refetch: () => {
            reads.refetch();
            gasBalance.refetch();
        },
    };
}
