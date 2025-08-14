import { Transaction } from '@/service/models/transaction.model';

// import { isForcedWithdrawal } from "@/utils/guards";

export const useTxTimestamp = (tx: Transaction) => {
    const confirmation = tx.send;
    // const confirmation = isForcedWithdrawal(tx) ? tx.deposit.send : tx.send;
    return confirmation.timestamp;
};
