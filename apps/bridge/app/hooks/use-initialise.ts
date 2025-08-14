import { useAccountEffect } from 'wagmi';

import { useLogout } from '@/service/stores/local-txs.store';

import { useActivityEffects } from './tx/use-activity-effects';
import { useInitialiseBridgeState } from './use-initialise-bridge-state';
import { useInitialiseQueryParams } from './use-initialise-query-params';

export const useInitialise = () => {
    const clearPendingTransactionsStorage = useLogout();

    useActivityEffects();
    useInitialiseQueryParams();
    useInitialiseBridgeState();

    useAccountEffect({
        onDisconnect: () => {
            clearPendingTransactionsStorage();
        },
    });
};
