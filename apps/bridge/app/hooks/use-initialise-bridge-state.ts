import { useEffect } from 'react';

import { useReset } from '@/service/hooks/use-bridge-reset';
import { useSetSelectedRoute } from '@/service/stores/route.store';
import { useSelectedToken } from '@/service/stores/token.store';

import { useModal } from './use-modal';

export const useInitialiseBridgeState = () => {
    const { isOpen } = useModal('Confirmation');
    const reset = useReset();
    const setSelectedRoute = useSetSelectedRoute();
    const selectedToken = useSelectedToken();

    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    useEffect(() => {
        setSelectedRoute(null);
    }, [selectedToken?.address, setSelectedRoute]);
};
