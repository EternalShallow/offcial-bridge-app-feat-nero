import { useMemo } from 'react';

import { Transaction } from '@/service/models/transaction.model';

import { useChain } from '../use-chains';

export const useTxFromTo = (tx: Transaction | null | undefined) => {
    const from = useChain(tx?.fromChainId);
    const to = useChain(tx?.toChainId);

    return useMemo(() => {
        if (!from || !to) {
            return null;
        }

        return { from, to };
    }, [from, to]);
};
