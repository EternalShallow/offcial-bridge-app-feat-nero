import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { useTransformPeriodText } from '@/hooks/use-transform-period-text';
import { Period } from '@/utils/get-period';

import { getTxBridgeDuration } from '../tx/use-tx-duration';

export const useApproxTotalBridgeTimeForRoute = (route: ReturnType<typeof useSelectedBridgeRoute>) => {
    let data: null | Period = null;

    if (route.data) {
        data = getTxBridgeDuration(route.data);
    }

    return {
        isLoading: route.isLoading,
        data,
    };
};

export const useApproxTotalBridgeTime = () => {
    const route = useSelectedBridgeRoute();
    return useApproxTotalBridgeTimeForRoute(route);
};

export const useApproxTotalBridgeTimeTextForRoute = (route: ReturnType<typeof useSelectedBridgeRoute>) => {
    const time = useApproxTotalBridgeTimeForRoute(route);

    const transformPeriod = useTransformPeriodText();

    if (time.isLoading) {
        return {
            data: null,
            isLoading: time.isLoading,
        };
    }

    if (!time.data) {
        return {
            isLoading: false,
            data: null,
        };
    }

    return {
        data: transformPeriod('transferTime', {}, time.data),
        isLoading: false,
    };
};

export const useApproxTotalBridgeTimeText = () => {
    const route = useSelectedBridgeRoute();
    return useApproxTotalBridgeTimeTextForRoute(route);
};
