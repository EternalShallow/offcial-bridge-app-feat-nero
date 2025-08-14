import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { Button } from '@/components/ui/button';
import { useReceiveAmount } from '@/hooks/amount/use-receive-amount';
import { useWeiAmount } from '@/hooks/amount/use-wei-amount';
import { useBridgeGasEstimate } from '@/hooks/fees/use-bridge-gas-estimate';
import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { newMockConfirmedTx } from '@/service/models/transaction.model';
import { useWaitingForBridgeSignature } from '@/service/stores/bridge.store';

import { useBuildPendingTx } from '../../components/confirmation/hooks/use-build-pending-tx';
import { useInitiateBridge } from '../../components/confirmation/hooks/use-initiate-bridge';
import { useApproved } from '../approvals/use-approved';
import { useNeedsExplicitApprove } from '../approvals/use-needs-explicit-approve';
import { getTxDurationForRoute } from '../tx/use-tx-duration';
import { isTransactionStep } from './common';
import { useRows } from './use-rows';

export const usePreSubmissionProgressRows = () => {
    const { t } = useTranslation();

    const buildPendingTx = useBuildPendingTx();
    const bridgeGasEstimate = useBridgeGasEstimate();
    const weiAmount = useWeiAmount();
    const receive = useReceiveAmount();
    const route = useSelectedBridgeRoute();

    const onInitiateBridge = useInitiateBridge();

    const needsExplicitApprove = useNeedsExplicitApprove();
    const approved = useApproved();
    const waitingForSignature = useWaitingForBridgeSignature();

    const rows = useRows(
        buildPendingTx(
            newMockConfirmedTx() /* overridde */,
            weiAmount,
            BigInt(receive.data?.token.raw ?? '0'),
            route.data?.id,
            getTxDurationForRoute(route.data),
            route.data?.result.steps ?? []
        )
    );

    const initiateButton = match({
        needsExplicitApprove,
        approved,
        waitingForSignature,
        routeLoading: route.isLoading,
    })
        .with({ waitingForSignature: true }, () => ({
            onSubmit: () => {},
            buttonText: t('bridging'),
            disabled: true,
        }))
        .with({ needsExplicitApprove: true, approved: false }, () => ({
            onSubmit: () => {},
            buttonText: t('buttons.start'),
            disabled: true,
        }))
        .otherwise(() => ({
            onSubmit: onInitiateBridge,
            buttonText: t('buttons.start'),
            disabled: route.isLoading,
        }));

    if (rows && isTransactionStep(rows[0])) {
        const ButtonComponent = () => (
            <Button onClick={initiateButton.onSubmit} disabled={initiateButton.disabled} size="sm">
                {initiateButton.buttonText}
            </Button>
        );
        ButtonComponent.displayName = 'ProgressRowButtonComponent';
        rows[0].ButtonComponent = ButtonComponent;
        rows[0].gasLimit = bridgeGasEstimate.data || undefined;
        rows[0].confirmation = undefined; /* override */
    }

    return rows;
};
