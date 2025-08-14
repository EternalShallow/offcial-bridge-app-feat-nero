import { useQuery } from '@tanstack/react-query';
import { toHex } from 'viem';
import { useAccount, useBytecode, useWalletClient } from 'wagmi';

import { ChainDto } from '@/service/models/chain.model';
import { useRejectedCallsUpdate } from '@/service/stores/setting.store';

import { useInitiatingChain } from '../tx/use-initiating-chain-id';
import { useFromChain } from '../use-chains';
import { useEvmAddress } from '../wallets/use-evm-address';

export const useCode = () => {
    const from = useFromChain();
    return useCodeOnChain(from);
};

export const useCodeOnChain = (chain: ChainDto | null) => {
    const evmAddress = useAccount().address;
    return useBytecode({
        address: evmAddress,
        chainId: Number(chain?.chainId),
        query: {
            refetchInterval: 10_000,
            // enabled: !chain?.solana,
        },
    });
};

export const useIs7702Account = () => {
    const code = useCode();

    // 7702
    if (code.data?.startsWith('0xef0100')) {
        return true;
    }

    return false;
};

export const useIs7702AccountOnChain = (chain: ChainDto | null) => {
    const code = useCodeOnChain(chain);

    // 7702
    if (code.data?.startsWith('0xef0100')) {
        return true;
    }

    return false;
};

export const useIsContractAccount = () => {
    const code = useCode();
    const is7702Account = useIs7702Account();

    if (is7702Account) {
        return false;
    }

    return !!code.data;
};

export const useIsContractAccountOnChain = (chain: ChainDto | null) => {
    const code = useCodeOnChain(chain);
    const is7702Account = useIs7702AccountOnChain(chain);

    if (is7702Account) {
        return false;
    }

    return !!code.data;
};

export const useCapabilitiesQuery = () => {
    const evmAddress = useEvmAddress();
    const initiatingChain = useInitiatingChain();
    const wallet = useWalletClient();

    return useQuery({
        queryKey: [
            'capabilities',
            evmAddress,
            initiatingChain?.id,
            wallet.data?.account?.address,
            wallet.data?.chain?.id,
        ],
        queryFn: async () => {
            if (!evmAddress || !initiatingChain?.id || !wallet.data) return false;

            const id = toHex(initiatingChain.id);
            try {
                const result = await wallet.data?.request({
                    method: 'wallet_getCapabilities',
                    params: [evmAddress, [id]],
                });

                if (typeof result === 'object' && ['ready', 'supported'].includes(result[id]?.atomic?.status)) {
                    return true;
                }
            } catch {}

            return false;
        },
    });
};

export const useSupportsSendCalls = () => {
    const manuallyRejectedCallsUpdate = useRejectedCallsUpdate();
    const capabilities = useCapabilitiesQuery();
    const evmAddress = useEvmAddress();
    if (evmAddress && manuallyRejectedCallsUpdate.find((a) => a.toLowerCase() === evmAddress.toLowerCase())) {
        return false;
    }
    return capabilities.data;
};
