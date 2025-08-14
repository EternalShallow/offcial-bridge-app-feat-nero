import { useTranslation } from 'react-i18next';
import { isPresent } from 'ts-is-present';

import { useTxToken } from '@/hooks/tokens/use-token';
import { useTxAmountOutput } from '@/hooks/tx/use-tx-amount-output';
import { useTxDuration } from '@/hooks/tx/use-tx-duration';
import { useTxFromTo } from '@/hooks/tx/use-tx-from-to';
import { Transaction } from '@/service/models/transaction.model';
import { isFailedTx } from '@/utils/guards';

// import { log } from '@/utils/log';

import { ActivityStep, buildWaitStep } from './common';

export const useGeneralProgressRows = (tx?: Transaction): ActivityStep[] => {
    const { t } = useTranslation();
    // const route = useSelectedBridgeRoute();

    const chains = useTxFromTo(tx);
    const token = useTxToken(tx);
    const outputAmount = useTxAmountOutput(tx, token);
    const duration = useTxDuration(tx);

    if (!tx || !chains) {
        return []; // isDeposit(tx) || isWithdrawal(tx) || isForcedWithdrawal(tx)
    }

    const isFailed = isFailedTx(tx);

    // log('【useGeneralProgressRows】', chains);
    const startBridgeStep = {
        label: t('confirmationModal.startBridgeOn', {
            from: chains.from.name,
        }),
        confirmation: tx.send,
        chain: chains.from,
    };
    const waitStep = buildWaitStep('wait', tx.send, tx.receive, duration, isFailed);
    const wrapStep = tx.wrap && {
        label: t('confirmationModal.stepTokenWrap', 'Token Wrap'),
        chain: chains.to,
        data: tx.wrap,
    };
    const receiveStep = {
        label: t('confirmationModal.getAmountOn', {
            to: chains.to.name,
            formatted: outputAmount?.text,
        }),
        confirmation: tx.receive,
        chain: chains.to,
        isFailed,
    };

    return [startBridgeStep, waitStep, wrapStep, receiveStep].filter(isPresent);
};
