import { Transaction } from '@/service/models/transaction.model';

export const getInitiatingTx = (tx: Transaction | undefined) => {
    if (!tx) return null;
    // if (isForcedWithdrawal(tx)) return tx.deposit.send;
    return tx.send;
};
export const useInitiatingTx = getInitiatingTx;
