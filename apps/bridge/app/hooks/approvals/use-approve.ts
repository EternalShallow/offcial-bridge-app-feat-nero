import { toast } from 'sonner';
import { Address, Chain, Hex } from 'viem';
import { useConfig } from 'wagmi';

import { useSetApproveConfirmation, useSetWaitingForApproveSignature } from '@/service/stores/bridge.store';
import { handleError } from '@/utils/error/error-handler';
import { isConfirmedFailedTx, isConfirmedSuccessTx, isFailedCall } from '@/utils/guards';

import { useTokenBalances } from '../balances/use-token-balances';
import { useGasPrice } from '../fees/use-gas-estimate';
import { useRouteGasEstimate } from '../fees/use-route-gas-estimate';
import { useSelectedBridgeRoute } from '../routes/use-bridge-route';
import { useSelectedToken } from '../tokens/use-token';
import { watchTransaction } from '../tx/use-activity-effects';
import { useInitiatingChain, useInitiatingChainDto } from '../tx/use-initiating-chain-id';
import { useSubmitTransactionEvm } from '../tx/use-tx-submit';
import { useAllowance } from './use-allowance';
import { useApproveGasEstimate } from './use-approve-gas-estimate';
import { useApproveTx, useApproveUsdtZeroData } from './use-approve-tx';

export function useApprove() {
    const route = useSelectedBridgeRoute();
    const allowance = useAllowance();
    const balances = useTokenBalances();
    const token = useSelectedToken();
    const config = useConfig();
    const chain = useInitiatingChain();
    const chainDto = useInitiatingChainDto();
    const { data: gasPrice } = useGasPrice(chainDto);
    const routeGasEstimate = useRouteGasEstimate(route.data);
    const submitTransaction = useSubmitTransactionEvm(chain);

    const setWaitingForApproveSignature = useSetWaitingForApproveSignature();
    const setApproveConfirmation = useSetApproveConfirmation();

    const gasEstimate = useApproveGasEstimate();
    const tx = useApproveTx(route.data);
    const approveZeroData = useApproveUsdtZeroData(route.data);

    return async () => {
        if (!token?.address || !tx || !chain || !gasEstimate || !gasPrice) return;
        setWaitingForApproveSignature(true);

        // log('useApprove', chain.name, allowance.data, gasEstimate, gasPrice);

        try {
            // Handle USDT approval: approve 0, then approve new value
            if (
                token.symbol === 'USDT' &&
                typeof allowance.data !== 'undefined' &&
                allowance.data > 0n &&
                tx.data &&
                approveZeroData
            ) {
                // 1. approve 0 first
                const approveZeroConfirmation = await submitTransaction({
                    data: approveZeroData,
                    to: tx.to as Address,
                    chain: chain as unknown as Chain,
                    gas: BigInt(Math.round(gasEstimate)),
                    gasPrice: gasPrice,
                });
                if (!approveZeroConfirmation || !chainDto) {
                    setWaitingForApproveSignature(false);
                    return;
                }
                // wait for approve(0) success
                await new Promise<void>((resolve, reject) => {
                    watchTransaction(config, chainDto, approveZeroConfirmation, (old, newC) => {
                        if (isFailedCall(newC) || isConfirmedFailedTx(newC)) {
                            setApproveConfirmation(newC);
                            toast.error('Approval failed', {
                                description: 'Please check transaction status in your wallet',
                            });
                            setWaitingForApproveSignature(false);
                            reject(new Error('Approve zero failed'));
                        }
                        if (isConfirmedSuccessTx(newC)) {
                            resolve();
                        }
                    });
                });
            }
            // 2. approve new value
            const confirmation = await submitTransaction({
                data: tx.data as Hex,
                to: tx.to as Address,
                chain: chain as unknown as Chain,
                gas: BigInt(Math.round(gasEstimate)),
                gasPrice: gasPrice,
            });

            if (!confirmation || !chainDto) {
                setWaitingForApproveSignature(false);
                return;
            }

            setApproveConfirmation(confirmation);

            watchTransaction(config, chainDto, confirmation, (old, newC) => {
                setApproveConfirmation(newC);

                if (isFailedCall(newC) || isConfirmedFailedTx(newC)) {
                    toast.error('Approval failed', { description: 'Please check transaction status in your wallet' });
                }

                if (isConfirmedSuccessTx(newC)) {
                    setTimeout(() => {
                        allowance.refetch();
                        balances.refetch();

                        if (routeGasEstimate.data?.needsRefreshAfterApprove) {
                            routeGasEstimate.refetch();
                        }
                    }, 200);
                }
            });
        } catch (e: any) {
            setApproveConfirmation(null);
            handleError(e);
            setWaitingForApproveSignature(false);
        }
    };
}
