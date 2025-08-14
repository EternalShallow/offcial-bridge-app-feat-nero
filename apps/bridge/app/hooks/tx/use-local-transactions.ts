import { useMemo } from 'react';

import { usePendingTransactions } from '@/service/stores/local-txs.store';
import { isAddressEqual } from '@/utils/is-address-equal';

import { useEvmAddress } from '../wallets/use-evm-address';
import { getTxRecipient } from './use-tx-recipient';
import { getTxSender } from './use-tx-sender';

export const useLocalTransactions = () => {
    const allLocal = usePendingTransactions();
    const evmAddress = useEvmAddress();

    return useMemo(
        () =>
            allLocal.filter((tx) => {
                const evmSender = getTxSender(tx);
                const evmRecipient = getTxRecipient(tx);

                return isAddressEqual(evmSender, evmAddress) || isAddressEqual(evmRecipient, evmAddress);
            }),
        [allLocal, evmAddress],
    );
};
