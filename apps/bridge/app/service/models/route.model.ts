import { RouteProvider } from '@/common/consts/route-provider';

import { TransactionDto } from './transaction.model';

export interface BridgeFee {
    amount: string;
    exclusive: boolean;
    group: {
        provider: string;
    };
    name: string;
    tokenAddress: string;
}

export interface BridgeStep {
    type: string;
    chainId?: string;
    duration?: number;
    estimatedGasLimit?: number;
}

export interface TokenApproval {
    tokenAddress: string;
    contractAddress: string;
    amount: string;
}

export interface RouteQuoteDto {
    fees: BridgeFee[];
    initiatingTransaction: TransactionDto;
    receive: string;
    steps: RouteQuoteDtoStepsItem[];
    duration: number;
    tokenApprovalAddress: string;
    tokenApprovalTransaction?: TransactionDto;
    // tokenApproval: TokenApproval;
}

export interface RouteResultDto {
    id: RouteProvider;
    result: RouteQuoteDto;
}

export const RouteStepType = {
    Initiate: 'Initiate',
    Prove: 'Prove',
    Finalize: 'Finalize',
    ForcedWithdrawal: 'ForcedWithdrawal',
    Wait: 'Wait',
    Receive: 'Receive',
    Wrap: 'Wrap',
} as const;
export type RouteStepType = (typeof RouteStepType)[keyof typeof RouteStepType];

export type RouteQuoteDtoStepsItem =
    | RouteStepTransactionDto
    | RouteStepWaitDto
    | RouteStepReceiveDto
    | RouteStepWrapDto;
export type RouteStepDto =
    | RouteStepWaitDto
    | RouteStepReceiveDto
    | RouteStepTransactionDto
    | RouteStepForcedWithdrawalDto
    | RouteStepWrapDto;

export interface RouteStepWrapDto {
    type: RouteStepType;
    bridgeTokenAddress: string;
    wrapTokenAddress: string;
}

export interface RouteStepWaitDto {
    duration: number;
    type: RouteStepType;
}

export interface RouteStepReceiveDto {
    chainId: string;
    type: RouteStepType;
}

export interface RouteStepTransactionDto {
    chainId: string;
    estimatedGasLimit: number;
    type: RouteStepType;
}

export interface RouteStepForcedWithdrawalDto {
    chainId: string;
    type: RouteStepType;
}
