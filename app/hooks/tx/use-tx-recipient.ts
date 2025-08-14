import { isAddress } from 'viem';

import { Transaction } from '@/service/models/transaction.model';

export const parseEncodedAddress = (address: string) => {
    if (isAddress(address)) return address;
    return '0x' + address.slice(-40);
};

export const getTxRecipient = (tx: Transaction | null | undefined) => {
    if (!tx) return null;
    return parseEncodedAddress(tx.to);
};

export const useTxRecipient = (tx: Transaction | null | undefined): string | null => {
    return getTxRecipient(tx);
};
