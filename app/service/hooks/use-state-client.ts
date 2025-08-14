import { useInjectedStore } from '@/common/providers/injected.provider';
import { useFromChainId } from '@/service/stores/bridge.store';

export const useClientState = () => {
    const injectedState = useInjectedStore((state) => state);
    const fromChainId = useFromChainId();

    if (!fromChainId) {
        throw new Error('Get App Config Error: fromChainId is required');
    }

    if (!injectedState.tokens?.[fromChainId]) {
        throw new Error(`Get App Config Error: tokens for ${fromChainId} is required`);
    }

    return injectedState;

    // return {
    //     ...injectedState,
    //     // tokens: injectedState.tokens?.[fromChainId] ?? [],
    // };
};
