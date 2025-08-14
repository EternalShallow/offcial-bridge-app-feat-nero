import { useQuery } from '@tanstack/react-query';

import { getBridgeConfig } from '../apis/bridge.api';

export const useGetBridgeConfig = (host: string) => {
    const { data, isLoading } = useQuery({
        queryKey: ['bridge_config', host],
        queryFn: () => getBridgeConfig({ host }),
        enabled: !!host,
    });

    return {
        data: data?.data,
        isLoading,
    };
};
