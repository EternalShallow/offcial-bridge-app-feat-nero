import { Transaction } from '@/service/models/transaction.model';

import { useEniWithdrawalProgressRows } from './eni/use-eni-withdrawal';
import { useGeneralProgressRows } from './row-general';

export const useRows = (tx?: Transaction) => {
    const general = useGeneralProgressRows(tx);
    const withdrawal = useEniWithdrawalProgressRows(tx);

    if (!tx) return null;

    return withdrawal || general;
};
