import { useAtomValue } from 'jotai';
import { Chain } from 'viem';

import { mainnetChainMap, mainnetChains } from '@/common/consts/network/mainnet-chains';
import { useClientState } from '@/service/hooks/use-state-client';
import { ChainDto } from '@/service/models/chain.model';
import { fromChainIdAtom, toChainIdAtom } from '@/service/stores/bridge.store';

export { useFromChainId, useToChainId } from '@/service/stores/bridge.store';

export function useChains() {
    const { chains } = useClientState();

    if (chains.length > 0) {
        return chains;
    }
    return mainnetChains;
}

export const useChain = (chainId: number | string | undefined | null): ChainDto | null => {
    const chains = useChains();

    if (!chainId) return null;
    const id = chainId.toString();

    return chains.find((chain) => chain.chainId === id) || mainnetChainMap[id] || null;
};

export const useFromChain = () => {
    const fromChainId = useAtomValue(fromChainIdAtom);
    return useChain(fromChainId);
};

export const useToChain = () => {
    const toChainId = useAtomValue(toChainIdAtom);
    return useChain(toChainId);
};

export const getChainByDto = (chain: ChainDto | null | undefined): Chain | null => {
    if (!chain) return null;

    return {
        id: +chain.chainId,
        name: chain.name,
        nativeCurrency: {
            name: chain.nativeCurrency.name,
            symbol: chain.nativeCurrency.symbol,
            decimals: chain.nativeCurrency.decimals,
        },
        rpcUrls: {
            default: {
                http: [...(chain.rpc ?? [])],
            },
        },
        blockExplorers: {
            default: {
                name: chain.name,
                url: chain.explorers?.[0]?.url ?? '',
            },
        },
    };
};
