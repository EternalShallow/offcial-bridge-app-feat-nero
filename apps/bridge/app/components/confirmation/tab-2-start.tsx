import { useTranslation } from 'react-i18next';
import { isPresent } from 'ts-is-present';

import { OIcon } from '@/components/icons/OIcon';
import { LineItem } from '@/components/transaction/LineItem';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReceiveAmount } from '@/hooks/amount/use-receive-amount';
import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { useApproxTotalBridgeTimeText } from '@/hooks/times/use-transfer-time';
import { useLatestSubmittedTx } from '@/hooks/tx/use-latest-submitted-tx';
import { useFromChain, useToChain } from '@/hooks/use-chains';
import { useRecipient, useSender } from '@/hooks/wallets/use-recipient';
import { useBridgeSubmitted, useRawAmount } from '@/service/stores/bridge.store';
import { useSelectedToken } from '@/service/stores/token.store';

// import { log } from '@/utils/log';

import { ActivityStep, isWaitStep } from '../../hooks/rows/common';
import { usePreSubmissionProgressRows } from '../../hooks/rows/use-progress-rows-submission';
import { useRows } from '../../hooks/rows/use-rows';
import { BridgeInfo } from '../bridge/BridgeInfo';
import { ApproveButton } from './ApproveButton';

export const ConfirmationModalStartTab = () => {
    const { t } = useTranslation();
    const bridgeSubmitted = useBridgeSubmitted();
    const route = useSelectedBridgeRoute();
    const transferTime = useApproxTotalBridgeTimeText();

    const from = useFromChain();
    const to = useToChain();
    const sender = useSender();
    const recipient = useRecipient();
    const token = useSelectedToken();
    const receive = useReceiveAmount();
    const rawAmount = useRawAmount();

    const lastSubmittedTx = useLatestSubmittedTx();
    const submittedRows = useRows(lastSubmittedTx);
    const preSubmissionProgressRows = usePreSubmissionProgressRows();

    const lineItems = bridgeSubmitted ? submittedRows : preSubmissionProgressRows;

    const getStepKey = (step: ActivityStep) => {
        if (isWaitStep(step)) return step.duration.toString();
        return step.label;
    };

    // log('Rows', bridgeSubmitted, lastSubmittedTx, lineItems);

    return (
        <Tabs defaultValue="steps" className="flex h-full flex-col">
            <DialogHeader className="items-center pt-9 pb-4">
                <DialogTitle className="text-3xl flex flex-col justify-center items-center gap-4">
                    <OIcon type="TOKEN" iconId={token?.symbol} size={14} />
                    <span className="text-center">
                        Bridge {rawAmount} {token?.symbol}
                    </span>
                    <span className="text-sm text-t4">{t('confirmationModal.nativeBridge')}</span>
                </DialogTitle>
            </DialogHeader>

            <div className="mx-auto">
                <TabsList>
                    <TabsTrigger variant="step" className="text-xs" value="steps">
                        {t('transaction.steps')}
                    </TabsTrigger>
                    <TabsTrigger variant="step" className="text-xs" value="info">
                        {t('transaction.bridgeInfo')}
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="steps">
                <div className="flex flex-col m-5 mt-1 border border-bg2 rounded-2xl divide-y divide-bg2 overflow-hidden">
                    {/* Approve gas token for arbitrum Native Token */}
                    {/* <ApproveGasTokenButton /> */}
                    <ApproveButton />

                    {lineItems
                        ?.filter(isPresent)
                        .map((step) => (
                            <LineItem
                                key={getStepKey(step)}
                                step={step}
                                tx={bridgeSubmitted ? lastSubmittedTx : undefined}
                            />
                        ))}
                </div>
            </TabsContent>

            <TabsContent value="info">
                <div className="p-5 pt-2">
                    <BridgeInfo
                        from={from}
                        to={to}
                        sender={sender}
                        recipient={recipient}
                        token={token}
                        sentAmount={rawAmount}
                        receivedAmount={receive.data?.token.amount.toString()}
                        provider={route.data?.id}
                        transferTime={transferTime.data ?? undefined}
                    />
                </div>
            </TabsContent>
        </Tabs>
    );
};
