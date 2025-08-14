import { useMemo } from 'react';

import { Address } from 'viem';

import { RouteResultDto } from '@/service/models/route.model';
import { isRouteQuote } from '@/utils/guards';

import { useSelectedBridgeRoute } from '../routes/use-bridge-route';

export function useApprovalAddress(): Address | undefined {
    const route = useSelectedBridgeRoute();
    return useApprovalAddressForRoute(route.data);
}

export function useApprovalAddressForRoute(route: RouteResultDto | undefined | null): Address | undefined {
    return useMemo(() => {
        if (!route || !isRouteQuote(route.result)) {
            return undefined;
        }

        const approvalAddress = route.result.tokenApprovalAddress as Address | undefined;

        // Add debug logging for undefined approval address
        // if (!approvalAddress) {
        //     console.warn('【useApprovalAddressForRoute】Approval address is undefined for route:', route.id);
        // }

        return approvalAddress;
    }, [route]);
}

export function useApprovalTxForRoute(route: RouteResultDto | undefined | null) {
    if (!route || !isRouteQuote(route.result)) {
        return;
    }

    return route.result.tokenApprovalTransaction;
}
