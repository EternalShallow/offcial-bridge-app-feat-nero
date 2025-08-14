import { useState } from 'react';

import { Address, Hex } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';

import { useBridgeGasEstimate } from '@/hooks/fees/use-bridge-gas-estimate';
import { useGasPrice } from '@/hooks/fees/use-gas-estimate';
import { useSubmitTransactionEvm } from '@/hooks/tx/use-tx-submit';
import { getChainByDto } from '@/hooks/use-chains';
import { useSwitchChain } from '@/hooks/wallets/use-switch-chain';
import { ChainDto } from '@/service/models/chain.model';
import { TransactionDto } from '@/service/models/transaction.model';
import { log } from '@/utils/log';

export function useSendTransactionDto(
    chainDto: ChainDto | null | undefined,
    getTransactionDto: () => Promise<TransactionDto>,
) {
    const [loading, setLoading] = useState(false);
    const account = useAccount();
    const chain = getChainByDto(chainDto);
    const wallet = useWalletClient({ chainId: chain?.id });
    const client = usePublicClient({ chainId: chain?.id });
    const switchChain = useSwitchChain();

    // gas
    const { data: gasPrice } = useGasPrice(chainDto);
    const { data: gas } = useBridgeGasEstimate();

    const submitTransaction = useSubmitTransactionEvm(chain);

    const onSubmit = async () => {
        if (!account.address || !wallet.data || !client || !chain) {
            return;
        }

        if (account.chainId !== chain.id || wallet.data.chain.id !== chain.id) {
            await switchChain(chain);
        }

        try {
            setLoading(true);

            const result = await getTransactionDto();

            const to = result.to as Address;
            const data = result.data as Hex;

            log('-----submitTransaction----', result);

            return await submitTransaction({
                to,
                data,
                chain,
                gas,
                gasPrice: gasPrice ?? undefined,
            });
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return {
        onSubmit,
        loading,
    };
}
