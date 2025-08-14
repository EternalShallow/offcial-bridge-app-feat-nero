import clsx from 'clsx';
import { formatDistanceToNowStrict } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import { useProviderName } from '@/common/consts/route-provider';
import { ProgressRowStatus } from '@/hooks/rows/common';
import { useTxToken } from '@/hooks/tokens/use-token';
import { useFinalisingTx } from '@/hooks/tx/use-finalising-tx';
import { useInitiatingTx } from '@/hooks/tx/use-initiating-tx';
import { useTxAmount } from '@/hooks/tx/use-tx-amount';
import { useTxFromTo } from '@/hooks/tx/use-tx-from-to';
import { useTxTimestamp } from '@/hooks/tx/use-tx-timestamp';
import { useModal } from '@/hooks/use-modal';
import { MessageStatus, Transaction } from '@/service/models/transaction.model';
import { usePendingFinalises } from '@/service/stores/local-txs.store';
import {
    isConfirmedFailedTx,
    isConfirmedSuccessTx,
    isConfirmedTx,
    isWithdrawal,
    isFailedCall,
    isFailedTx,
} from '@/utils/guards';

import { IconCheckCircle, IconCloseCircle } from '../icons';
import { OIcon } from '../icons/OIcon';
import { useActionRow } from './ActivityActionRow';

const useIsSuccessfulBridge = (tx: Transaction) => {
    const finalTx = useFinalisingTx(tx);
    return finalTx && isConfirmedSuccessTx(finalTx) && tx.status === MessageStatus.Completed;
};

const useIsFailedBridge = (tx: Transaction) => {
    const initialTx = useInitiatingTx(tx);
    return !!initialTx && (isConfirmedFailedTx(initialTx) || isFailedCall(initialTx) || isFailedTx(tx));
};

const useIsInProgress = (tx: Transaction) => {
    const isFailed = useIsFailedBridge(tx);
    const finalTx = useFinalisingTx(tx);
    return !isFailed && !finalTx;
};

const useProgressBars = (tx: Transaction): { status: ProgressRowStatus; name: string }[] => {
    const initiatingTx = useInitiatingTx(tx);
    const finalisingTx = useFinalisingTx(tx);
    const proveTx = isWithdrawal(tx) ? tx.prove : null; // isForcedWithdrawal(tx) ? tx.withdrawal?.prove : null;
    const pendingFinalises = usePendingFinalises();

    const pendingFinalise = pendingFinalises.find((f) => f.id === tx.id);

    const bars: {
        status: ProgressRowStatus;
        name: string;
    }[] = [];

    if (initiatingTx && isConfirmedSuccessTx(initiatingTx)) {
        bars.push({ status: ProgressRowStatus.Done, name: 'initiating' });
    } else {
        bars.push({ status: ProgressRowStatus.InProgress, name: 'initiating' });
    }

    //  || isForcedWithdrawal(tx)
    if (isWithdrawal(tx)) {
        // if (proveTx) {
        //     bars.push({ status: ProgressRowStatus.Done, name: 'prove' });
        // } else if (initiatingTx && !isConfirmedSuccessTx(initiatingTx)) {
        //     bars.push({ status: ProgressRowStatus.NotDone, name: 'prove' });
        // } else {
        //     bars.push({ status: ProgressRowStatus.InProgress, name: 'prove' });
        // }
        if (finalisingTx) {
            bars.push({ status: ProgressRowStatus.Done, name: 'finalise' });
        } else if (proveTx || pendingFinalise) {
            bars.push({ status: ProgressRowStatus.InProgress, name: 'finalise' });
        } else {
            bars.push({ status: ProgressRowStatus.NotStarted, name: 'finalise' });
        }
        return bars;
    }

    if (initiatingTx && !isConfirmedTx(initiatingTx)) {
        bars.push({ status: ProgressRowStatus.NotStarted, name: 'finalise' });
    } else if (finalisingTx) {
        bars.push({ status: ProgressRowStatus.Done, name: 'finalise' });
    } else {
        bars.push({ status: ProgressRowStatus.InProgress, name: 'finalise' });
    }

    return bars;
};

export const ActivityRow = ({ tx }: { tx: Transaction }) => {
    const token = useTxToken(tx);
    // const multichainToken = useTxMultichainToken(tx);

    const chains = useTxFromTo(tx);
    const modal = useModal('TransactionDetails');
    const timestamp = useTxTimestamp(tx);
    const amount = useTxAmount(tx, token);

    const isSuccessful = useIsSuccessfulBridge(tx);
    const isFailed = useIsFailedBridge(tx);
    const isInProgress = useIsInProgress(tx);
    const bars = useProgressBars(tx);

    const provider = tx.provider;
    const providerName = useProviderName(provider);

    const { ActionDescription, ActionButton } = useActionRow(tx) ?? {};

    return (
        <div
            className="bg-bg1 w-full rounded-2xl flex flex-col relative border border-bg2 shadow-sm"
            key={tx.id}
            role="button"
            tabIndex={0}
            onClick={(e) => {
                e.stopPropagation();
                modal.open(tx.id);
            }}
        >
            {/* p-6 pb-5 lg:p-8 lg:pb-7 */}
            <div className="flex justify-between py-4 px-4 lg:px-6 w-full gap-1 lg:gap-0 border-b border-border">
                <div className="flex items-center -mt-1 lg:mt-0.5 gap-2">
                    <div className="flex items-center">
                        <OIcon
                            type="CHAIN"
                            iconId={chains?.from.chainId ?? ''}
                            className="h-5 w-5 rounded-md shadow-sm"
                        />
                        <div className="relative z-0 right-0.5 flex items-center justify-center bg-gray-100 rounded-md w-5 h-5">
                            <ArrowRight className="w-3 h-3" />
                        </div>
                        <OIcon
                            type="CHAIN"
                            iconId={chains?.to.chainId ?? ''}
                            className="relative z-1 right-1 h-5 w-5 rounded-md shadow-sm"
                        />
                    </div>
                    <span className="text-xs text-right text-t1">
                        <span className="hidden md:inline">Via</span> {providerName}
                    </span>
                    {/* {provider === RouteProvider.EniForcedWithdrawal && (
                        <div className="bg-muted rounded-full px-1 flex items-center gap-1">
                            <IconEscapeHatch className="w-6 h-6 shrink-0" />
                        </div>
                    )} */}
                </div>

                {isInProgress && ActionDescription}
                {isSuccessful && (
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center rounded-full border pl-2 pr-3 py-1.5">
                            <IconCheckCircle className="fill-success w-4 h-4" />
                            <span className="text-xs lg:text-sm text-success">Bridge success</span>
                        </div>
                    </div>
                )}
                {/* Orbiter expired and returned */}
                {/* {isExpiredAndReturned && (
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center rounded-full border pl-2 pr-3 py-1.5">
                            <IconReturnCircle className="fill-destructive w-4 h-4" />
                            <span className="text-xs lg:text-sm">Bridge expired & returned</span>
                        </div>
                    </div>
                )} */}
                {isFailed && (
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center rounded-full border pl-2 pr-3 py-1.5">
                            <IconCloseCircle className="fill-destructive w-4 h-4 " />
                            <span className="text-xs lg:text-sm text-destructive">Bridge failed</span>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex w-full gap-2.5 lg:gap-3 py-4 px-4 lg:px-6">
                <OIcon
                    type="TOKEN"
                    iconId={token?.symbol ?? ''}
                    className="h-10 w-10 lg:h-12 lg:w-12"
                    containerClassName="shrink-0 lg:mt-1"
                />
                <div className="flex flex-col justify-center w-full gap-3">
                    <div className="flex justify-between items-start">
                        <span className="text-2xl lg:text-3xl leading-none">{amount?.text}</span>
                    </div>
                    {isInProgress && (
                        <>
                            <div>
                                <div className="w-full flex items-center gap-1">
                                    {bars.map((bar) => (
                                        <div
                                            key={`${tx.id}-${bar.name}`}
                                            className={clsx(
                                                'w-full h-1.5 rounded-full',
                                                bar.status === ProgressRowStatus.Done && 'bg-foreground',
                                                bar.status === ProgressRowStatus.InProgress &&
                                                    'bg-foreground animate-pulse',
                                                bar.status === ProgressRowStatus.NotStarted && 'bg-muted'
                                            )}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {isInProgress && ActionButton}
            </div>
            <div className="flex justify-between items-center px-4 lg:px-6 pb-4">
                <span className="text-xs lg:text-sm text-t4 leading-none">
                    {formatDistanceToNowStrict(timestamp)} ago
                </span>
            </div>
        </div>
    );
};
