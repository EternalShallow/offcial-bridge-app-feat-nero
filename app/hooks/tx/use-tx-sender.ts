import { Transaction } from '@/service/models/transaction.model';

import { parseEncodedAddress } from './use-tx-recipient';

export const getTxSender = (tx: Transaction | null | undefined) => {
    if (!tx) return null;
    return parseEncodedAddress(tx.from);
};

export const useTxSender = (tx: Transaction | null | undefined) => {
    return getTxSender(tx);
};
