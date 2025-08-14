import { JSX } from 'react';

import { ChainDto } from '@/service/models/chain.model';
import { RouteStepType, RouteStepWrapDto } from '@/service/models/route.model';
import { Confirmation } from '@/service/models/transaction.model';
import { isConfirmedSuccessTx } from '@/utils/guards';

export const ProgressRowStatus = {
    NotStarted: 'not-started',
    InProgress: 'in-progress',
    Done: 'done',
} as const;

export type ProgressRowStatus = (typeof ProgressRowStatus)[keyof typeof ProgressRowStatus];

export type TransactionStep = {
    label: string;
    gasLimit?: number | bigint;
    chain: ChainDto;
    ButtonComponent?: () => JSX.Element;
    confirmation?: Confirmation;
    isExpiredAndReturned?: boolean;
    isFailed?: boolean;
};

export type WaitStepInProgress = {
    startedAt: number;
    duration: number;
    label: string;
};
export type WaitStepDone = {
    duration: number;
    done: true;
    label: string;
};
export type WaitStepNotStarted = {
    duration: number;
    label: string;
};

export type WaitStep = WaitStepInProgress | WaitStepNotStarted | WaitStepDone;

export type ActivityStep = WaitStep | TransactionStep | WrapStep;

export const isWaitStep = (x: ActivityStep): x is WaitStep => {
    return typeof (x as WaitStep).duration === 'number';
};
export const isWaitStepInProgress = (x: WaitStep): x is WaitStepInProgress => {
    return typeof (x as WaitStepInProgress).startedAt === 'number';
};

export const isWaitStepDone = (x: WaitStep): x is WaitStepDone => {
    return (x as WaitStepDone).done === true;
};

export const isTransactionStep = (x: ActivityStep): x is TransactionStep => {
    return 'chain' in x;
};

export type WrapStep = {
    label: string;
    chain: ChainDto;
    data: RouteStepWrapDto;
};

export const isWrapStep = (x: ActivityStep): x is WrapStep => {
    return (
        (x as WrapStep)?.data?.type === RouteStepType.Wrap ||
        !!((x as WrapStep)?.data?.wrapTokenAddress && (x as WrapStep)?.data?.bridgeTokenAddress)
    );
};

/**
 * Buttons are always dependent on some wait period elapsing.
 */
export const isButtonEnabled = (timestamp: number | undefined, duration: number) => {
    if (!timestamp) return false;
    return timestamp + duration < Date.now();
};

export const buildWaitStep = (
    label: string,
    start: Confirmation | undefined,
    end: Confirmation | undefined,
    duration: number,
    done: boolean | undefined,
    showActualDuration = true
): WaitStep => {
    if (start && end && isConfirmedSuccessTx(start) && isConfirmedSuccessTx(end)) {
        let actualDuration = end.timestamp - start.timestamp;
        if (!showActualDuration) {
            actualDuration = duration;
        }
        if (actualDuration < 0) {
            actualDuration = duration;
        }
        const a: WaitStepDone = {
            duration: actualDuration,
            done: true,
            label,
        };
        return a;
    }

    if (done) {
        const a: WaitStepDone = { duration, done: true, label };
        return a;
    }

    if (!start || !isConfirmedSuccessTx(start)) {
        const a: WaitStepNotStarted = { duration, label };
        return a;
    }

    const a: WaitStepInProgress = { duration, startedAt: start.timestamp, label };
    return a;
};
