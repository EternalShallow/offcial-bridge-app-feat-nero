import { useMemo } from 'react';

import { getInitiatingTx } from '@/hooks/tx/use-initiating-tx';
import { useTransactions } from '@/service/hooks/use-transactions';
import { usePendingTransactions } from '@/service/stores/local-txs.store';

// import { log } from '@/utils/log';

export const useLatestSubmittedTx = () => {
    const { transactions } = useTransactions();
    const pendingTransactions = usePendingTransactions();

    return useMemo(() => {
        const all = [...pendingTransactions, ...transactions].sort((a, b) => {
            const aTimestamp = getInitiatingTx(a)?.timestamp ?? 0;
            const bTimestamp = getInitiatingTx(b)?.timestamp ?? 0;

            return bTimestamp - aTimestamp;
        });
        return all[0] ?? null;
    }, [pendingTransactions, transactions]);
};
