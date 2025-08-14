import { useQuery } from '@tanstack/react-query';

import { getBridgeConfig } from '../apis/bridge.api';
import { defaultAppConfig } from '@/common/consts/global';
import { isTestnet } from '@/common/consts/env';

export const useGetBridgeConfig = (host: string) => {
    return useQuery({
        queryKey: ['bridge_config', host],
        queryFn: async () => {
            try {
                // Try to get config from API first
                const config = await getBridgeConfig({ host });
                if (config?.data) {
                    return config.data;
                }
            } catch (error) {
                console.warn('API config failed, using local config:', error);
            }
            
            // Fallback to local config if API fails
            return defaultAppConfig;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        retryDelay: 1000,
    });
};
