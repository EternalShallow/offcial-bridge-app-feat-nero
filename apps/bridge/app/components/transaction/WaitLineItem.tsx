import React, { useEffect, useState } from 'react';

import { RouteProvider } from '@/common/consts/route-provider';
import { IconCheckCircle, IconSpinner, IconTime } from '@/components/icons';
import { WaitStep, isWaitStepDone, isWaitStepInProgress } from '@/hooks/rows/common';
import { Transaction } from '@/service/models/transaction.model';
import { formatDuration, formatDurationToNow } from '@/utils/get-period';

// import { log } from '@/utils/log';

export const useTimer = (duration: number | undefined, startedAt: number | undefined) => {
    const [remainingDuration, setRemainingDuration] = useState<string | null>('');

    useEffect(() => {
        if (startedAt && duration) {
            setRemainingDuration(formatDuration(startedAt || 0, (startedAt || 0) + (duration || 0)));
        }
    }, [startedAt, duration]);

    useEffect(() => {
        if (!duration || !startedAt) return;
        let interval = null;
        const updateDuration = () => {
            const remaining = formatDuration(Date.now(), startedAt + duration);
            setRemainingDuration(remaining);
        };

        updateDuration();
        interval = setInterval(updateDuration, 1000);
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [duration, startedAt]);

    return remainingDuration;
};

const LineItem = ({ step, tx }: { step: WaitStep; tx?: Transaction }) => {
    const remainingDuration = useTimer(
        isWaitStepInProgress(step) ? step.startedAt : undefined,
        isWaitStepInProgress(step) ? step.duration : undefined
    );

    const hasTimeElapsed = isWaitStepInProgress(step) && step.startedAt + step.duration < Date.now();

    const WaitStatus = () => {
        if (isWaitStepDone(step)) {
            return <IconCheckCircle className="w-5 h-5 fill-success" />;
        }
        // if (isWaitStepInProgress(step) && isFailedTx(tx)) {
        //     return <IconCheckCircle className="w-5 h-5 fill-success" />;
        // }
        if (isWaitStepInProgress(step)) {
            return (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {hasTimeElapsed ? 'Checking...' : !!remainingDuration ? `~${remainingDuration} to go` : ''}
                    </span>
                    <IconSpinner className="h-4 w-4 p-0.5 text-foreground fill-foreground" />
                </div>
            );
        }
        return null;
    };

    // log('WaitLineItem', isWaitStepInProgress(step), step.startedAt, step.duration, Date.now());

    return (
        <div className="flex gap-4 justify-start items-center">
            <div className="flex items-center gap-2">
                <IconTime className="w-4 h-auto" />

                <span className="text-sm font-heading leading-none">
                    {tx?.provider === RouteProvider.Orbiter
                        ? 'Wait a short moment'
                        : `Wait ${formatDurationToNow(Date.now() + step.duration)}`}
                </span>
            </div>

            <span className="ml-auto">
                <WaitStatus />
            </span>
        </div>
    );
};

export const WaitLineItem = React.memo(LineItem);
