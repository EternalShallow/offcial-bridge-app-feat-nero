import { useMemo } from 'react';

import { Address } from 'viem';
import { useBalance } from 'wagmi';

import { useEvmAddress } from '../wallets/use-evm-address';

export const useEvmGasBalance = (chainId: number | undefined, address: string | undefined | null) => {
    const balance = useBalance({
        chainId: chainId,
        address: (address || undefined) as Address | undefined,
        // query: {
        //     enabled: !chain?.solana,
        // },
    });

    return useMemo(
        () => ({
            isLoading: balance.isLoading,
            data: balance.data?.value,
            refetch: balance.refetch,
        }),
        [balance.data?.value, balance.isLoading, balance.refetch]
    );
};

export const useGasBalance = (chainId: number | undefined) => {
    const evmAddress = useEvmAddress();
    // const chain = useChain(chainId);
    // const svmAddress = useSvmAddress();
    // const svmBalance = useSvmGasBalance(chainId, svmAddress);
    const evmBalance = useEvmGasBalance(chainId, evmAddress);
    // return chain?.solana ? svmBalance : evmBalance;
    return evmBalance;
};

export const useGasBalanceWithAddress = (chainId: number | undefined, address: string | undefined | null) => {
    // const chain = useChain(chainId);
    // const svmBalance = useSvmGasBalance(chainId, address);
    const evmBalance = useEvmGasBalance(chainId, address);
    // return chain?.solana ? svmBalance : evmBalance;
    return evmBalance;
};

// export const useSvmGasBalance = (chainId: number | undefined, address: string | undefined | null) => {
//     const chain = useChain(chainId);
//     const connection = useMemo(() => {
//         const endpoint = chain?.rpcUrls.default.http[0] ?? '';
//         if (!endpoint) return null;
//         return new Connection(endpoint, {
//             commitment: 'confirmed',
//         });
//     }, [chain]);

//     return useQuery({
//         queryKey: ['svm gas balance', chain?.id, address],
//         queryFn: async () => {
//             if (!address || !connection) return BigInt(0);
//             const result = await connection.getBalance(new PublicKey(address));
//             return BigInt(result);
//         },
//         enabled: !!address && !!chain?.solana,
//     });
// };
