import { useQuery } from '@tanstack/react-query';
import { isPresent } from 'ts-is-present';

import { useApproved } from '@/hooks/approvals/use-approved';
import { DEFAULT_GAS } from '@/service/apis/gas.api';
import { RouteResultDto } from '@/service/models/route.model';
import { isInsufficientGasError } from '@/utils/error/error-catch';

import { useApproveTx } from '../approvals/use-approve-tx';
import { useHasInsufficientBalance } from '../balances/use-has-insufficient-balance';
import { useChain } from '../use-chains';
import { useSender } from '../wallets/use-recipient';
import { useGasApprove } from './use-gas-approve';
import { useGasInitiating } from './use-gas-initiating';
import { useRouteInitiatingTx } from './use-route-initiating-tx';

export interface RouteGasEstimateData {
    success: boolean;
    needsRefreshAfterApprove?: boolean;
    insufficientGas?: boolean;
    estimates: {
        limit: number;
        chainId: string;
    }[];
}

export const useRouteGasEstimate = (route: RouteResultDto | null) => {
    const sender = useSender();
    const approvalTx = useApproveTx(route);
    const approved = useApproved();
    const hasInsufficientBalance = useHasInsufficientBalance();
    const initiatingTransaction = useRouteInitiatingTx(route);
    const chain = useChain(initiatingTransaction?.chainId);

    // Prepare approval item for gas estimation
    const approvalItem = !approved && approvalTx ? { ...approvalTx, from: sender! } : null;
    const approvalGasEstimate = useGasApprove(chain, approvalItem);

    // Prepare initiating item for gas estimation
    const initiatingItem = initiatingTransaction ? { ...initiatingTransaction, from: sender! } : null;
    const initiatingGasEstimate = useGasInitiating(route, chain, initiatingItem);

    return useQuery<RouteGasEstimateData | null>({
        queryKey: [
            'useRouteGasEstimate',
            // Only include core dependencies to reduce unnecessary refetches
            approvalTx?.chainId,
            approvalTx?.to,
            initiatingTransaction?.chainId,
            initiatingTransaction?.to,
            chain?.rpc?.[0], // Only use the first RPC URL as identifier
            hasInsufficientBalance,
            sender,
            // Add route ID as stable identifier
            route?.id,
        ],
        queryFn: async () => {
            if (!initiatingTransaction) return null;

            // console.log('【useRouteGasEstimate】', approvalGasEstimate.data, initiatingGasEstimate.data);

            const transactionsForGasEstimate = approvalItem ? [approvalItem, initiatingItem] : [initiatingItem];
            const defaultEstimates = transactionsForGasEstimate.map((tx) => ({
                limit: DEFAULT_GAS,
                chainId: tx?.chainId ?? '',
            }));

            if (hasInsufficientBalance || !chain || !sender) {
                return {
                    success: false,
                    estimates: defaultEstimates,
                };
            }

            try {
                const approvalLimit = approvalGasEstimate.data;
                const initiatingLimit = initiatingGasEstimate.data;

                const approvalEstimate =
                    approvalItem && approvalLimit
                        ? { limit: Number(approvalLimit), chainId: approvalItem.chainId }
                        : null;

                const initiatingEstimate =
                    initiatingItem && initiatingLimit
                        ? { limit: initiatingLimit, chainId: initiatingItem.chainId }
                        : null;

                console.log('【useRouteGasEstimate】', approvalEstimate, initiatingEstimate);

                // Check if at least one valid gas estimate is available
                const validEstimates = [approvalEstimate, initiatingEstimate].filter(isPresent);
                if (validEstimates.length === 0) {
                    console.warn('【useRouteGasEstimate】 No valid gas estimates available, using defaults');
                    return {
                        success: false,
                        estimates: defaultEstimates,
                    };
                }

                return {
                    success: true,
                    estimates: validEstimates,
                    needsRefreshAfterApprove: true,
                };
            } catch (error) {
                console.error('Gas estimation failed:', error);

                if (isInsufficientGasError(error)) {
                    return {
                        success: false,
                        insufficientGas: true,
                        estimates: defaultEstimates,
                    };
                }

                // For other errors, try to use partial results instead of directly falling back to defaults
                const partialEstimates = [];
                if (approvalGasEstimate.data) {
                    partialEstimates.push({
                        limit: Number(approvalGasEstimate.data),
                        chainId: approvalItem?.chainId ?? '',
                    });
                }
                if (initiatingGasEstimate.data) {
                    partialEstimates.push({
                        limit: Number(initiatingGasEstimate.data),
                        chainId: initiatingItem?.chainId ?? '',
                    });
                }

                if (partialEstimates.length > 0) {
                    console.warn('【useRouteGasEstimate】 Using partial gas estimates due to error:', error);
                    return {
                        success: true,
                        estimates: partialEstimates,
                        needsRefreshAfterApprove: true,
                    };
                }

                return {
                    success: false,
                    estimates: defaultEstimates,
                };
            }
        },
        staleTime: 1000 * 15, // Increased to 15 seconds to reduce refetch frequency
        gcTime: 1000 * 60, // Increased to 1 minute to extend cache time
        // Add retry mechanism to avoid failures due to temporary network issues
        retry: (failureCount, error) => {
            // Don't retry for business logic errors (like insufficient balance)
            if (isInsufficientGasError(error)) {
                return false;
            }
            // Retry up to 2 times
            return failureCount < 2;
        },
        // Add retry delay to avoid immediate retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};
