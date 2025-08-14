import { useEffect } from 'react';

import { useAtom } from 'jotai';

import { useBridgeRoutes } from '@/service/hooks/use-bridge-routes';
import { selectedRouteAtom } from '@/service/stores/route.store';

export const useSelectedBridgeRoute = () => {
    const { data, isLoading, isError, error } = useBridgeRoutes();
    const [selectedRoute, setSelectedRoute] = useAtom(selectedRouteAtom);

    const currentRoute = data?.data?.find((route) => route.id === selectedRoute) ?? null;

    useEffect(() => {
        if ((!selectedRoute || !currentRoute) && data?.data?.length && data.data.length > 0) {
            setSelectedRoute(data.data[0].id);
        }
    }, [selectedRoute, currentRoute, data, setSelectedRoute]);

    // useEffect(() => {
    //     if (isError) {
    //         console.error('【useSelectedBridgeRoute】', error?.message);
    //     }
    // }, [isError, error]);

    return {
        data: currentRoute || (data?.data?.[0] ?? null),
        isLoading,
        isError,
        error,
    };
};
