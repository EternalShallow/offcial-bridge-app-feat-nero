import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { getInitiatingHash } from '@/hooks/tx/use-initiating-hash';
import { Confirmation, Transaction } from '@/service/models/transaction.model';
import { isFailedCall, isNotSubmittedCall, isNotSubmittedSafeTx } from '@/utils/guards';

import { activeIdsAtom } from './modal.store';

interface PendingTx {
    id: string;
    chainId: number;
    confirmation: Confirmation;
}

const getUniqueConfirmationId = (c: Confirmation): string => {
    if (isNotSubmittedSafeTx(c)) return c.safeTransactionHash;
    if (isNotSubmittedCall(c) || isFailedCall(c)) return c.id;
    return c.transactionHash;
};

// base atoms
export const transactionsAtom = atomWithStorage<Transaction[]>('local-txns-transactions', []);
export const pendingProvesAtom = atomWithStorage<PendingTx[]>('local-txns-pending-proves', []);
export const pendingFinalisesAtom = atomWithStorage<PendingTx[]>('local-txns-pending-finalises', []);

export const usePendingTransactions = () => useAtomValue(transactionsAtom);
export const usePendingProves = () => useAtomValue(pendingProvesAtom);
export const usePendingFinalises = () => useAtomValue(pendingFinalisesAtom);

// derived atoms and actions
export const addTransactionAtom = atom(null, (get, set, tx: Transaction) => {
    const currentTxs = get(transactionsAtom);
    set(transactionsAtom, [tx, ...currentTxs]);
});

export const removeTransactionByIdAtom = atom(null, (get, set, id: string) => {
    const currentTxs = get(transactionsAtom);
    set(
        transactionsAtom,
        currentTxs.filter((tx) => tx.id !== id),
    );
});

export const removeTransactionByHashAtom = atom(null, (get, set, { hash, newId }: { hash: string; newId: string }) => {
    const currentTxs = get(transactionsAtom);
    const activeIds = get(activeIdsAtom);

    set(
        transactionsAtom,
        currentTxs.filter((tx) => {
            const match = getInitiatingHash(tx) === hash;
            if (match) {
                if (activeIds.TransactionDetails === tx.id) {
                    set(activeIdsAtom, {
                        ...activeIds,
                        TransactionDetails: newId,
                    });
                }
                return false;
            }
            return true;
        }),
    );
});

export const updateTransactionAtom = atom(
    null,
    (
        get,
        set,
        { oldConfirmation, newConfirmation }: { oldConfirmation: Confirmation; newConfirmation: Confirmation },
    ) => {
        const currentTxs = get(transactionsAtom);
        set(
            transactionsAtom,
            currentTxs.map((tx) => {
                const send = tx.send;
                const matches = getUniqueConfirmationId(send) === getUniqueConfirmationId(oldConfirmation);

                if (matches) {
                    return {
                        ...tx,
                        send: newConfirmation,
                    };
                }
                return tx;
            }),
        );
    },
);

// pending proves actions
export const addProvingAtom = atom(null, (get, set, tx: PendingTx) => {
    const currentProves = get(pendingProvesAtom);
    set(pendingProvesAtom, [...currentProves, tx]);
});

export const updateProvingAtom = atom(
    null,
    (get, set, { id, confirmation }: { id: string; confirmation: Confirmation }) => {
        const currentProves = get(pendingProvesAtom);
        set(
            pendingProvesAtom,
            currentProves.map((p) => (id === p.id ? { ...p, confirmation } : p)),
        );
    },
);

export const removeProvingAtom = atom(null, (get, set, id: string) => {
    const currentProves = get(pendingProvesAtom);
    set(
        pendingProvesAtom,
        currentProves.filter((p) => p.id !== id),
    );
});

// pending finalises actions
export const addFinalisingAtom = atom(null, (get, set, tx: PendingTx) => {
    const currentFinalises = get(pendingFinalisesAtom);
    set(pendingFinalisesAtom, [...currentFinalises, tx]);
});

export const updateFinalisingAtom = atom(
    null,
    (get, set, { id, confirmation }: { id: string; confirmation: Confirmation }) => {
        const currentFinalises = get(pendingFinalisesAtom);
        set(
            pendingFinalisesAtom,
            currentFinalises.map((p) => (id === p.id ? { ...p, confirmation } : p)),
        );
    },
);

export const removeFinalisingAtom = atom(null, (get, set, id: string) => {
    const currentFinalises = get(pendingFinalisesAtom);
    set(
        pendingFinalisesAtom,
        currentFinalises.filter((p) => p.id !== id),
    );
});

export const useAddFinalising = () => useSetAtom(addFinalisingAtom);
export const useUpdateFinalising = () => useSetAtom(updateFinalisingAtom);
export const useRemoveFinalising = () => useSetAtom(removeFinalisingAtom);

// logout action
export const useLogout = () => {
    const setTransactions = useSetAtom(transactionsAtom);
    const setPendingProves = useSetAtom(pendingProvesAtom);
    const setPendingFinalises = useSetAtom(pendingFinalisesAtom);

    return () => {
        setTransactions([]);
        setPendingProves([]);
        setPendingFinalises([]);
    };
};
