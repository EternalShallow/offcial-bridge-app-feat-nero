import { memo, useCallback, useMemo } from 'react';

import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';

import { RouteProvider } from '@/common/consts/route-provider';
import { isWaitStep } from '@/hooks/rows/common';
import { useRows } from '@/hooks/rows/use-rows';
import { useTxToken } from '@/hooks/tokens/use-token';
import { useLocalTransactions } from '@/hooks/tx/use-local-transactions';
import { useTxAmount } from '@/hooks/tx/use-tx-amount';
import { useTxAmountOutput } from '@/hooks/tx/use-tx-amount-output';
import { useTxDuration } from '@/hooks/tx/use-tx-duration';
import { useChain } from '@/hooks/use-chains';
import { useModal } from '@/hooks/use-modal';
import { useTransformPeriodText } from '@/hooks/use-transform-period-text';
import { useTransactions } from '@/service/hooks/use-transactions';
import { Transaction } from '@/service/models/transaction.model';
import { getPeriod } from '@/utils/get-period';

import { BridgeInfo, BridgeInfoProps } from '../bridge/BridgeInfo';
import { OIcon } from '../icons/OIcon';
import { RouteProviderName } from '../icons/route-provider-icon';
import { LineItem } from '../transaction/LineItem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const useTransactionById = (id?: string) => {
    const { transactions } = useTransactions();
    const pendingTransactions = useLocalTransactions();

    return useMemo(() => {
        if (!id) return;
        return transactions.find((x) => id === x.id) || pendingTransactions.find((x) => id === x.id);
    }, [id, transactions, pendingTransactions]);
};

// Memoized Rows component
const Rows = memo(({ tx }: { tx?: Transaction }) => {
    const rows = useRows(tx);

    if (!tx) return;

    return (
        <>
            {rows?.map((item) => (
                <LineItem key={isWaitStep(item) ? item.duration.toString() : item.label} step={item} tx={tx} />
            ))}
        </>
    );
});

Rows.displayName = 'Rows';

// Memoized CloseButton component
const CloseButton = memo(() => {
    return (
        <DialogClose asChild>
            <button className="rounded-full w-8 h-8 shrink-0 flex items-center justify-center bg-muted hover:scale-105 transition-all focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="fill-foreground w-3 h-3"
                >
                    <path d="M0.562404 13.4244C-0.205637 12.6425 -0.187241 11.8653 0.617592 11.0697L4.68315 7.00411L0.617592 2.95695C-0.178043 2.14752 -0.205637 1.37028 0.589998 0.574646C1.38563 -0.220989 2.13528 -0.193394 2.95851 0.616038L7.01027 4.6678L11.062 0.629835C11.8577 -0.179597 12.6349 -0.193394 13.4167 0.574646C14.2124 1.37028 14.1848 2.16132 13.3891 2.97075L9.33738 7.00871L13.3891 11.0329C14.1986 11.8561 14.1986 12.6196 13.4167 13.4152C12.6349 14.197 11.8577 14.1832 11.0482 13.3876L7.01027 9.33583L2.95851 13.4014C2.14907 14.197 1.35804 14.2108 0.562404 13.429V13.4244Z" />
                </svg>
                <span className="sr-only">Close</span>
            </button>
        </DialogClose>
    );
});

CloseButton.displayName = 'CloseButton';

// Memoized TransactionHeader component
const TransactionHeader = memo(({ token, amount, provider }: { token: any; amount: any; provider: any }) => {
    return (
        <DialogHeader className="flex items-center pt-0 pb-3">
            <OIcon
                type="TOKEN"
                iconId={token?.symbol}
                size={14}
                className="rounded-md"
                containerClassName="mt-10 mb-4"
            />
            <DialogTitle className="flex flex-col gap-2 text-3xl text-center leading-none">
                Bridge {amount?.formatted} {token?.symbol} <br />
                <div className="flex gap-1 justify-center items-center">
                    {/* {provider === RouteProvider.EniForcedWithdrawal && (
                        <div className="flex items-center gap-1">
                            <IconEscapeHatch className="w-6 h-6 shrink-0" />
                            <span className="text-xs text-muted-foreground leading-none">Escape hatch</span>
                        </div>
                    )} */}
                    {provider !== RouteProvider.EniForcedWithdrawal && (
                        <span className="text-xs text-muted-foreground leading-none">
                            Via <RouteProviderName provider={provider} />
                        </span>
                    )}
                </div>
            </DialogTitle>
        </DialogHeader>
    );
});

TransactionHeader.displayName = 'TransactionHeader';

// Memoized TabsList component
const TabsListComponent = memo(({ t }: { t: any }) => {
    return (
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
    );
});

TabsListComponent.displayName = 'TabsListComponent';

// Memoized StepsContent component
const StepsContent = memo(({ tx }: { tx?: Transaction }) => {
    return (
        <TabsContent value="steps">
            <div className="flex flex-col m-5 mt-1 border border-bg2 rounded-2xl divide-y divide-bg2 overflow-hidden">
                <Rows tx={tx} />
            </div>
        </TabsContent>
    );
});

StepsContent.displayName = 'StepsContent';

// Memoized InfoContent component
const InfoContent = memo(
    ({ from, to, sender, recipient, token, provider, sentAmount, receivedAmount, transferTime }: BridgeInfoProps) => {
        return (
            <TabsContent value="info">
                <div className="p-5 pt-1">
                    <BridgeInfo
                        from={from}
                        to={to}
                        sender={sender}
                        recipient={recipient}
                        token={token}
                        provider={provider}
                        sentAmount={sentAmount}
                        receivedAmount={receivedAmount}
                        transferTime={transferTime}
                    />
                </div>
            </TabsContent>
        );
    }
);

InfoContent.displayName = 'InfoContent';

const Content = memo(() => {
    const { t } = useTranslation();
    const modal = useModal('TransactionDetails');
    const tx = useTransactionById(modal.data);

    const token = useTxToken(tx);
    const amount = useTxAmount(tx, token);
    const outputAmount = useTxAmountOutput(tx, token);
    const provider = tx?.provider;

    const { from: sender, to: recipient } = tx ?? {};
    const from = useChain(tx?.fromChainId);
    const to = useChain(tx?.toChainId);

    const duration = useTxDuration(tx);
    const transformPeriodIntoText = useTransformPeriodText();

    const transferTime = useMemo(() => {
        return transformPeriodIntoText('transferTime', {}, getPeriod(duration / 1000));
    }, [transformPeriodIntoText, duration]);

    return (
        <>
            <div className="flex justify-end items center px-4 py-3 sticky top-0">
                <CloseButton />
            </div>
            <div className="overflow-y-auto bg-background">
                <Tabs defaultValue="steps" className="flex h-full flex-col">
                    <TransactionHeader token={token} amount={amount} provider={provider} />
                    <TabsListComponent t={t} />

                    <StepsContent tx={tx} />
                    <InfoContent
                        from={from}
                        to={to}
                        sender={sender}
                        recipient={recipient}
                        token={token}
                        sentAmount={amount?.formatted}
                        receivedAmount={outputAmount?.formatted}
                        provider={provider}
                        transferTime={transferTime}
                    />
                </Tabs>
            </div>
        </>
    );
});

Content.displayName = 'Content';

export const TransactionDetailsModal = memo(() => {
    const modal = useModal('TransactionDetails');

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                modal.close();
            }
        },
        [modal]
    );

    return (
        <Dialog open={modal.isOpen} onOpenChange={handleOpenChange}>
            <DialogContent hideCloseButton>
                <Content />
            </DialogContent>
        </Dialog>
    );
});

TransactionDetailsModal.displayName = 'TransactionDetailsModal';
