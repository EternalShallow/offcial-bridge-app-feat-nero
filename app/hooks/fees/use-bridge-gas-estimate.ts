import { useQuery } from '@tanstack/react-query';

import { RouteResultDto } from '@/service/models/route.model';

import { useSelectedBridgeRoute } from '../routes/use-bridge-route';
import { useRouteGasEstimate } from './use-route-gas-estimate';

// Gas Limit
export const useBridgeGasEstimate = () => {
    const route = useSelectedBridgeRoute();
    return useBridgeGasEstimateForRoute(route.data);
};

export const useBridgeGasEstimateForRoute = (route: RouteResultDto | null) => {
    const estimate = useRouteGasEstimate(route);

    // console.log('【useBridgeGasEstimateForRoute】', route?.id, estimate.data);

    return useQuery({
        queryKey: ['bridge gas estimate', route?.id, ...(estimate?.data?.estimates.map((x) => x.limit) ?? [])],
        queryFn: () => {
            if (!estimate.data) return null;
            return estimate.data.estimates[estimate.data.estimates.length - 1].limit;
        },
        staleTime: 1000 * 15, // 15 seconds - bridge gas estimate
        gcTime: 1000 * 30, // 30 seconds - keep in cache longer
    });
};

// Gas Data
export const useBridgeGasEstimateData = () => {
    const route = useSelectedBridgeRoute();
    return useRouteGasEstimate(route.data);
};

// Gas Status
export const useBridgeGasEstimateStatus = () => {
    const route = useSelectedBridgeRoute();
    return useBridgeGasEstimateStatusForRoute(route.data);
};

export const useBridgeGasEstimateStatusForRoute = (route: RouteResultDto | null) => {
    const estimate = useRouteGasEstimate(route);

    // console.log('[status] estimate', estimate.isFetching, estimate.data);

    if (estimate.isFetching) {
        return {
            isFetching: true,
            data: undefined,
        };
    }

    return {
        isFetching: false,
        data: estimate.data ? estimate.data.success : undefined,
    };
};
