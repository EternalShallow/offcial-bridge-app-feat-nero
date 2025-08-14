import { useTranslation } from 'react-i18next';

import { IconSpinner } from '@/components/icons';
import { LineItem, useTimer } from '@/components/transaction/LineItem';
import { Button } from '@/components/ui/button';
import { useApprove } from '@/hooks/approvals/use-approve';
import { useApproveGasEstimate } from '@/hooks/approvals/use-approve-gas-estimate';
import { useApproved } from '@/hooks/approvals/use-approved';
import { useNeedsExplicitApprove } from '@/hooks/approvals/use-needs-explicit-approve';
import { useSelectedToken } from '@/hooks/tokens/use-token';
import { useFromChain } from '@/hooks/use-chains';
import { newMockConfirmedTx } from '@/service/models/transaction.model';
import { useApproveConfirmation, useWaitingForApproveSignature } from '@/service/stores/bridge.store';

export const ApproveButton = () => {
    const { t } = useTranslation();
    const approve = useApprove();
    const approveGasEstimate = useApproveGasEstimate();
    const fromToken = useSelectedToken();
    const from = useFromChain();
    const approved = useApproved();
    const needsExplicitApprove = useNeedsExplicitApprove();

    const approveConfirmation = useApproveConfirmation();
    const waitingForApproveSignature = useWaitingForApproveSignature();

    // const isOptimismForcedWithdrawal = useIsOptimismForcedWithdrawal();
    const remainingDuration = useTimer(
        approveConfirmation?.timestamp,
        undefined, // isOptimismForcedWithdrawal 1000 * 60 * 5
    );

    if (!needsExplicitApprove || !from) {
        return null;
    }
    const isWaitingForForceApprove = !!approveConfirmation?.timestamp; // isOptimismForcedWithdrawal
    const label = t('confirmationModal.approve', { symbol: fromToken?.symbol }); // isOptimismForcedWithdrawal ? `Force approve ${fromToken?.symbol}` :

    // console.log('【ApproveButton】', approved, isWaitingForForceApprove);

    return (
        <>
            <LineItem
                step={{
                    label,
                    chain: from,
                    gasLimit: approved || isWaitingForForceApprove ? undefined : approveGasEstimate || undefined,
                    ButtonComponent: () =>
                        isWaitingForForceApprove ? (
                            <div className="flex items-center gap-2">
                                {!!remainingDuration && (
                                    <span className="text-xs text-muted-foreground">~{remainingDuration} to go</span>
                                )}
                                <IconSpinner className="h-6 w-6 p-0.5 text-foreground fill-foreground" />
                            </div>
                        ) : (
                            <Button onClick={approve} disabled={waitingForApproveSignature} size="sm">
                                {t('buttons.approve')}
                            </Button>
                        ),
                    confirmation: (() => {
                        if (approved && approveConfirmation) return approveConfirmation;
                        if (approved) return newMockConfirmedTx();
                        return approveConfirmation || undefined;
                        // if (isOptimismForcedWithdrawal) return undefined;
                    })(),
                }}
            />
        </>
    );
};
