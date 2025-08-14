import { RouteProvider } from '@/common/consts/route-provider';
import {
    RouteQuoteDto,
    RouteStepDto,
    RouteStepTransactionDto,
    RouteStepType,
    RouteStepWaitDto,
    RouteStepWrapDto,
} from '@/service/models/route.model';
import {
    Confirmation,
    ConfirmedTx,
    FailedCall,
    MessageStatus,
    NotSubmittedCall,
    NotSubmittedSafeTx,
    SubmittedTx,
    Transaction,
    TransactionStatus,
} from '@/service/models/transaction.model';

export const RouteErrorType = {
    GenericError: 'GenericError',
    AmountTooSmall: 'AmountTooSmall',
    AmountTooLarge: 'AmountTooLarge',
    Paused: 'Paused',
    Disabled: 'Disabled',
} as const;
export type RouteErrorType = (typeof RouteErrorType)[keyof typeof RouteErrorType];

export interface GenericRouteErrorDto {
    error: string;
    type: RouteErrorType;
}
export interface AmountTooLargeRouteErrorDto {
    maximum: string;
    type: RouteErrorType;
}
export interface AmountTooSmallRouteErrorDto {
    minimum: string;
    type: RouteErrorType;
}
export interface PausedRouteErrorDto {
    type: RouteErrorType;
}
export interface DisabledRouteErrorDto {
    type: RouteErrorType;
}

type RouteQuote =
    | RouteQuoteDto
    | GenericRouteErrorDto
    | AmountTooLargeRouteErrorDto
    | AmountTooSmallRouteErrorDto
    | PausedRouteErrorDto
    | DisabledRouteErrorDto;

type RouteQuoteError =
    | GenericRouteErrorDto
    | AmountTooLargeRouteErrorDto
    | AmountTooSmallRouteErrorDto
    | PausedRouteErrorDto
    | DisabledRouteErrorDto;

export const isRouteQuoteError = (a: RouteQuote): a is RouteQuoteError => {
    return !!(a as any).type;
};

export const isRouteQuote = (a: RouteQuote | undefined): a is RouteQuoteDto => {
    if (!a) return false;
    return !!(a as RouteQuoteDto).initiatingTransaction;
};

export const isRouteWaitStep = (a: RouteStepDto): a is RouteStepWaitDto => {
    return a.type === RouteStepType.Wait;
};

export const isRouteWrapStep = (a: RouteStepDto): a is RouteStepWrapDto => {
    return a.type === RouteStepType.Wrap;
};

export const isConfirmedTx = (x: Confirmation): x is ConfirmedTx => {
    return !!(x as ConfirmedTx).timestamp && !!(x as ConfirmedTx).status && !!(x as ConfirmedTx).transactionHash;
};

export const isSubmittedTx = (x: Confirmation): x is SubmittedTx => {
    return (x as SubmittedTx).type === 'submitted-tx';
};

export const isNotSubmittedSafeTx = (x: Confirmation): x is NotSubmittedSafeTx => {
    return (x as NotSubmittedSafeTx).type === 'not-submitted-safe-tx';
};

export const isNotSubmittedCall = (x: Confirmation): x is NotSubmittedCall => {
    return (x as NotSubmittedCall).type === 'not-submitted-call';
};

export const isConfirmedSuccessTx = (x: Confirmation): x is ConfirmedTx => {
    return (
        !(x as any).type &&
        !!(x as ConfirmedTx).timestamp &&
        !!(x as ConfirmedTx).transactionHash &&
        (x as ConfirmedTx).transactionHash !== '0x' &&
        (x as ConfirmedTx).status === TransactionStatus.Confirmed
    );
};

export const isConfirmedFailedTx = (x: Confirmation): x is ConfirmedTx => {
    return (
        !(x as any).type &&
        !!(x as ConfirmedTx).timestamp &&
        !!(x as ConfirmedTx).transactionHash &&
        (x as ConfirmedTx).status !== TransactionStatus.Confirmed
    );
};

export const isFailedCall = (x: Confirmation): x is FailedCall => {
    return (x as FailedCall).type === 'failed-call';
};

export const isFailedTx = (x: Transaction | undefined | null): boolean => {
    if (!x) return false;
    return x.status === MessageStatus.Failed;
};

export const isRouteTransactionStep = (a: RouteStepDto): a is RouteStepTransactionDto => {
    const options: RouteStepType[] = [RouteStepType.Initiate, RouteStepType.Prove, RouteStepType.Finalize];
    return options.includes(a.type);
};

export const isWithdrawal = (tx: Pick<Transaction, 'provider'>): tx is Transaction => {
    const providers: RouteProvider[] = [RouteProvider.EniWithdrawal, RouteProvider.NEROWithdrawal];

    return providers.includes(tx.provider);
};

export const isForcedWithdrawal = (tx: Pick<Transaction, 'provider'>): tx is Transaction => {
    const providers: RouteProvider[] = [RouteProvider.EniForcedWithdrawal, RouteProvider.NEROForcedWithdrawal];

    return providers.includes(tx.provider);
};

export const isOrbiter = (tx: Pick<Transaction, 'provider'>): tx is Transaction => {
    return RouteProvider.Orbiter === tx.provider;
};
