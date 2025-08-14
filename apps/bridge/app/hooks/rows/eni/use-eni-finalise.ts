import { toast } from 'sonner';
import { useConfig } from 'wagmi';

import { watchTransaction } from '@/hooks/tx/use-activity-effects';
import { useGetFinaliseTransaction } from '@/hooks/tx/use-finalising-tx';
import { getInitiatingHash } from '@/hooks/tx/use-initiating-hash';
import { Transaction } from '@/service/models/transaction.model';
import { useAddFinalising, useRemoveFinalising, useUpdateFinalising } from '@/service/stores/local-txs.store';
import { isConfirmedFailedTx, isConfirmedSuccessTx, isFailedCall } from '@/utils/guards';

import { useTxFromTo } from '../../tx/use-tx-from-to';
import { useSendTransactionDto } from './use-send-transaction-dto';

// import { usePaused } from './use-paused';

export function useEniFinalise(withdrawal: Transaction) {
    const chains = useTxFromTo(withdrawal);
    const addFinalising = useAddFinalising();
    const removeFinalising = useRemoveFinalising();
    const updateFinalising = useUpdateFinalising();
    const getFinaliseTransaction = useGetFinaliseTransaction();
    const wagmiConfig = useConfig();
    // const paused = usePaused(deployment);
    // const blockProveFinalisePausedModal = useModal('BlockProveFinalisePaused');

    const { loading, onSubmit } = useSendTransactionDto(chains?.to, () =>
        getFinaliseTransaction.mutateAsync(withdrawal.id).then((x) => x.data),
    );

    const onFinalise = async () => {
        if (!chains?.to) return;
        // if (paused) {
        //     // blockProveFinalisePausedModal.open(deployment?.id);
        //     return;
        // }

        const initiatingTransaction = getInitiatingHash(withdrawal);
        if (!initiatingTransaction) return;

        const confirmation = await onSubmit();
        if (!confirmation) return;

        addFinalising({ id: withdrawal.id, chainId: +chains.to.chainId, confirmation });

        watchTransaction(wagmiConfig, chains.to, confirmation, (oldC, newC) => {
            if (isFailedCall(newC) || isConfirmedFailedTx(newC)) {
                toast.error('Transaction failed', {
                    description: 'Please check transaction status in your wallet',
                });

                removeFinalising(withdrawal.id);
            } else if (!isConfirmedSuccessTx(newC)) {
                updateFinalising({ id: withdrawal.id, confirmation: newC });
            }
        });
    };

    return {
        onFinalise,
        loading,
    };
}
