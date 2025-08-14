import { Token } from '@/service/models/token.model';

import { useTokenBalances } from './use-token-balances';

export function useTokenBalance(token: Token | null | undefined) {
    const tokenBalances = useTokenBalances();
    // const chains = useChains();

    if (!token) {
        return {
            isLoading: false,
            data: 0n,
        };
    }

    if (tokenBalances.isLoading) {
        return {
            isLoading: true,
            data: 0n,
        };
    }

    return {
        isLoading: false,
        data:
            tokenBalances.data?.find((x) => {
                // const chain = chains.find((c) => c.chainId === token.chainId.toString());
                // if (!chain) return 0n;
                // return (
                //     x.token[token.chainId]?.address &&
                //     isAddressEqual(chain, x.token[token.chainId]!.address, chain, token.address)
                // );
                return x.token.address === token.address;
            })?.balance ?? 0n,
    };
}
