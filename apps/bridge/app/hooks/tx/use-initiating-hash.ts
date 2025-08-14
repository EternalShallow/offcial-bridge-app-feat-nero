import { Transaction } from '@/service/models/transaction.model';
import { isConfirmedTx, isSubmittedTx } from '@/utils/guards';

export function getInitiatingHash(tx: Transaction) {
    // const confirmation = isForcedWithdrawal(tx) ? tx.deposit.send : tx.send;

    const confirmation = tx.send;

    if (isSubmittedTx(confirmation) || isConfirmedTx(confirmation)) {
        return confirmation.transactionHash;
    }

    return null;
}
export const useInitiatingHash = getInitiatingHash;
