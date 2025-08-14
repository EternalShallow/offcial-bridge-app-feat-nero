import { useTranslation } from 'react-i18next';

import { RouteProvider } from '@/common/consts/route-provider';
import { Button } from '@/components/ui/button';
import { useChain } from '@/hooks/use-chains';
import { FINALIZE_GAS } from '@/service/apis/gas.api';
import { Transaction, TransactionType } from '@/service/models/transaction.model';
import { MessageStatus } from '@/service/models/transaction.model';
import { usePendingFinalises } from '@/service/stores/local-txs.store';
import { isWithdrawal } from '@/utils/guards';

import { useTxToken } from '../../tokens/use-token';
import { useTxAmountOutput } from '../../tx/use-tx-amount-output';
import { ActivityStep, TransactionStep, buildWaitStep } from '../common';
import { useEniFinalise } from './use-eni-finalise';

const FinaliseButton = ({ withdrawal, ready }: { withdrawal: Transaction; ready: boolean }) => {
    const { t } = useTranslation();
    const finalise = useEniFinalise(withdrawal);

    return (
        <Button onClick={finalise.onFinalise} size={'sm'} disabled={finalise.loading || !ready}>
            {t('buttons.get')}
        </Button>
    );
};

export const useEniWithdrawalProgressRows = (withdrawal?: Transaction): ActivityStep[] | null => {
    const pendingFinalises = usePendingFinalises();
    const { t } = useTranslation();
    const token = useTxToken(withdrawal);
    const outputAmount = useTxAmountOutput(withdrawal, token);
    const isWithdrawalTx = withdrawal && isWithdrawal(withdrawal) && withdrawal?.type === TransactionType.Withdrawal;

    const from = useChain(withdrawal?.fromChainId);
    const to = useChain(withdrawal?.toChainId);

    if (!isWithdrawalTx || !withdrawal || !from || !to) {
        return null;
    }

    const pendingFinalise = pendingFinalises.find((f) => f.id === withdrawal?.id);
    // const pendingProve = pendingProves.find((f) => f.id === withdrawal?.id);

    const withdrawStep: TransactionStep = {
        label: t('confirmationModal.startBridgeOn', {
            from: from?.name,
        }),
        confirmation: withdrawal?.send,
        chain: from,
    };

    const readyToFinalize = withdrawal?.status === MessageStatus.Claimable;

    const finaliseStep: TransactionStep = {
        label: t('confirmationModal.getAmountOn', {
            to: to.name,
            formatted: outputAmount?.text,
        }),
        confirmation: withdrawal?.receive || pendingFinalise?.confirmation,
        chain: to,
        ButtonComponent: () => <FinaliseButton withdrawal={withdrawal} ready={readyToFinalize} />,
        gasLimit: withdrawal?.receive ? undefined : FINALIZE_GAS,
    };

    return [
        withdrawStep,
        buildWaitStep(
            'op-finalise-wait',
            withdrawal?.send, // withdrawal?.prove,
            withdrawal?.receive,
            withdrawal?.duration,
            readyToFinalize,
            false
        ),
        finaliseStep,
    ];
};
