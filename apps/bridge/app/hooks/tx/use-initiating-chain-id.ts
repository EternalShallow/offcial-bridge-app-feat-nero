import { useMemo } from 'react';

import { Chain } from 'viem';

import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { getChainByDto, useChain } from '@/hooks/use-chains';
import { ChainDto } from '@/service/models/chain.model';
import { isRouteQuote, isRouteTransactionStep } from '@/utils/guards';

export const useInitiatingChainId = () => {
    const route = useSelectedBridgeRoute();

    return route.data?.result &&
        isRouteQuote(route.data.result) &&
        route.data.result.steps[0] &&
        isRouteTransactionStep(route.data.result.steps[0])
        ? parseInt(route.data.result.steps[0].chainId)
        : undefined;
};

export const useInitiatingChain = (): Chain | null => {
    const chainDto = useInitiatingChainDto();
    return useMemo(() => (chainDto ? getChainByDto(chainDto) : null), [chainDto]);
};

export const useInitiatingChainDto = (): ChainDto | null => {
    const chainId = useInitiatingChainId();
    const chain = useChain(chainId);
    return useMemo(() => (chain ? chain : null), [chain]);
};
