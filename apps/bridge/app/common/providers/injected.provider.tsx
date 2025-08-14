import { ReactNode } from 'react';

import { atom, useAtomValue, useSetAtom } from 'jotai';

import { defaultAppConfig } from '@/common/consts/global';
import type { InjectedState } from '@/service/models/inject.model';
import { TokenType } from '@/service/models/token.model';
import { fromChainIdAtom, toChainIdAtom } from '@/service/stores/bridge.store';
import { destinationTokenAtom, selectedTokenAtom } from '@/service/stores/token.store';

export const injectedStateAtom = atom<InjectedState | null>(null);

export interface InjectedStoreProviderProps {
    children: ReactNode;
    initialValues: InjectedState;
}

export const InjectedStoreProvider = ({ children, initialValues }: InjectedStoreProviderProps) => {
    const injectedStore = createInjectedStore(initialValues);
    const setInjectedStore = useSetAtom(injectedStateAtom);
    setInjectedStore(injectedStore);
    useInitStore(injectedStore);
    // console.log('[InjectedStoreProvider]', injectedStore);

    return <>{children}</>;
};

export const useInjectedStore = <T,>(selector: (state: InjectedState) => T): T => {
    const state = useAtomValue(injectedStateAtom);
    if (!state) {
        throw new Error('useInjectedStore must be used within InjectedStoreProvider');
    }
    return selector(state);
};

export const createInjectedStore = (initialValues: InjectedState) => {
    const s = { ...defaultAppConfig, ...initialValues };

    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);

        const fromChainId = params.get('fromChainId');
        const toChainId = params.get('toChainId');
        if (fromChainId && toChainId) {
            const from = s.chains?.find((c) => c.chainId === fromChainId);
            const to = s.chains?.find((c) => c.chainId === toChainId);
            if (from && to) {
                s.fromChainId = +from.chainId;
                s.toChainId = +to.chainId;
            }
        }
    }

    s.fromChainId = s.fromChainId || s.defaultRoute.fromChainId;
    s.toChainId = s.toChainId || s.defaultRoute.toChainId;

    const fromChainTokens = s.tokens[s.fromChainId] || [];
    const toChainTokens = s.tokens[s.toChainId] || [];

    // Find default from token
    s.defaultFromToken = fromChainTokens.find((t) => t.address === s.defaultRoute.tokenAddress) || fromChainTokens[0];

    // Find matching destination token if source token exists
    s.defaultToToken = s.defaultFromToken
        ? toChainTokens.find((t) => t.coinKey === s.defaultFromToken?.coinKey && t.tokenType === TokenType.WRAPPED) ||
          toChainTokens.find((t) => t.coinKey === s.defaultFromToken?.coinKey) ||
          toChainTokens[0]
        : toChainTokens[0];

    // Test: Bridged token
    // s.defaultToToken = s.defaultFromToken
    //     ? toChainTokens.find((t) => t.coinKey === s.defaultFromToken?.coinKey && t.tokenType === TokenType.BRIDGED) ||
    //       toChainTokens.find((t) => t.coinKey === s.defaultFromToken?.coinKey) ||
    //       toChainTokens[0]
    //     : toChainTokens[0];

    return s;
};

export const useInitStore = (state: InjectedState) => {
    const setFromChainId = useSetAtom(fromChainIdAtom);
    const setToChainId = useSetAtom(toChainIdAtom);
    const setSelectedToken = useSetAtom(selectedTokenAtom);
    const setDestinationToken = useSetAtom(destinationTokenAtom);

    if (state.fromChainId) setFromChainId(state.fromChainId);
    if (state.toChainId) setToChainId(state.toChainId);

    if (state.defaultFromToken) setSelectedToken(state.defaultFromToken);
    if (state.defaultToToken) setDestinationToken(state.defaultToToken);
};
