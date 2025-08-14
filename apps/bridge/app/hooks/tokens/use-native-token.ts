import { useChain, useFromChain, useToChain } from '@/hooks/use-chains';

export function useNativeTokenForChainId(chainId: string | undefined) {
    return useChain(chainId)?.nativeCurrency;
}

export function useNativeToken() {
    const from = useFromChain();
    return useNativeTokenForChainId(from?.chainId);
}

export function useToNativeToken() {
    const to = useToChain();

    return useNativeTokenForChainId(to?.chainId);
}
