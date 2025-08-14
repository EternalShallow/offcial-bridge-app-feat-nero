import { atom, useAtomValue, useSetAtom } from 'jotai';

const modalNames = [
    'Confirmation',
    'RouteSelector',
    'TokenSelector',
    'Activity',
    'TransactionDetails',
    'TokenSelect',
    'ChainSelect',
    // 'FeeBreakdown',
    // 'RecipientAddress',
    // 'WithdrawSettings',
    // 'NetworkSelector',
    // 'Settings',
    // 'WithdrawalReadyToFinalize',
    // 'Legal',
    // 'GasInfo',
    // 'CustomTokenImport',
    // 'CustomTokenListImport',
    // 'BlockProving',
    // 'BlockProving2',
    // 'BlockProveFinalisePaused',
    // 'FaultProof',
    // 'CustomWarpRoutes',
    // 'FiatOnrampTokenSelector',
    // 'AddNetwork',
    // 'ActivityFilter',
] as const;
export type ModalName = (typeof modalNames)[number];

export const modalsAtom = atom<{ [x in ModalName]?: boolean }>({});
export const activeIdsAtom = atom<{ [x in ModalName]?: string | undefined }>({});

export const addModalAtom = atom(null, (get, set, name: ModalName) => {
    const state = get(modalsAtom);
    set(modalsAtom, {
        ...state,
        [name]: true,
    });
});

export const removeModalAtom = atom(null, (get, set, name: ModalName) => {
    const modalsState = get(modalsAtom);
    const activeIdsState = get(activeIdsAtom);

    set(modalsAtom, {
        ...modalsState,
        [name]: false,
    });

    set(activeIdsAtom, {
        ...activeIdsState,
        [name]: undefined,
    });
});

export const setActiveIdAtom = atom(null, (get, set, name: ModalName, activeId: string) => {
    const state = get(activeIdsAtom);
    set(activeIdsAtom, {
        ...state,
        [name]: activeId,
    });
});

export const useModals = () => useAtomValue(modalsAtom);
export const useActiveIds = () => useAtomValue(activeIdsAtom);
export const useAddModal = () => useSetAtom(addModalAtom);
export const useRemoveModal = () => useSetAtom(removeModalAtom);
export const useSetActiveId = () => useSetAtom(setActiveIdAtom);

// export type ModalType = 'TokenSelect' | 'ChainSelect' | 'Confirmation' | 'TransactionDetails' | 'RouteSelect';
// export interface ModalData {
//     chainSelect: {
//         type: 'from' | 'to';
//     };
//     tokenSelect: {
//         type: 'from' | 'to';
//     };
// }
