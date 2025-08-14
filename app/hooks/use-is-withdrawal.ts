import { useMemo } from 'react';

import { withdrawalRoutes } from '@/common/consts/route-provider';
import { useSelectedRoute } from '@/service/stores/route.store';

export const useIsWithdrawal = () => {
    const selectedRoute = useSelectedRoute();

    return useMemo(() => {
        if (!selectedRoute) return false;

        return withdrawalRoutes.includes(selectedRoute);
    }, [selectedRoute]);
};
