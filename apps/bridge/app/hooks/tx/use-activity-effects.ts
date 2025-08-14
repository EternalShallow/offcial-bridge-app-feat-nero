import { useEffect } from 'react';

import { Config, getCallsStatus, getTransactionReceipt, waitForTransactionReceipt } from '@wagmi/core';
import { useSetAtom } from 'jotai';
import { Hex, withTimeout } from 'viem';
import { useConfig } from 'wagmi';

import { getOnchainHashFromSafeHash } from '@/service/apis/onchain.api';
import { useTransactions } from '@/service/hooks/use-transactions';
import { ChainDto } from '@/service/models/chain.model';
import {
    Confirmation,
    Transaction,
    TransactionStatus,
    newFailedCall,
    newSubmittedTx,
} from '@/service/models/transaction.model';
import {
    removeFinalisingAtom,
    removeProvingAtom,
    removeTransactionByHashAtom,
    removeTransactionByIdAtom,
    updateFinalisingAtom,
    updateTransactionAtom,
    usePendingFinalises,
    usePendingTransactions,
} from '@/service/stores/local-txs.store';
import {
    isConfirmedFailedTx,
    isFailedCall,
    isNotSubmittedCall,
    isNotSubmittedSafeTx,
    isSubmittedTx,
} from '@/utils/guards';
import { logTx as log } from '@/utils/log';

import { useChains } from '../use-chains';
import { getInitiatingHash } from './use-initiating-hash';

export const watchTransaction = async (
    wagmiConfig: Config,
    chain: ChainDto,
    confirmation: Confirmation,
    onUpdate: (oldConfirmation: Confirmation, newConfirmation: Confirmation) => void
): Promise<void> => {
    log('watching', chain.chainId, confirmation);

    if (isNotSubmittedCall(confirmation)) {
        log('NotSubmittedCall', confirmation.id);
        const calls = await withTimeout(
            () =>
                getCallsStatus(wagmiConfig, {
                    id: confirmation.id,
                }),
            { timeout: 5000 }
        ).catch(() => null);

        const hash = calls?.receipts?.[0]?.transactionHash;

        if (calls?.status === 'failure') {
            log('NotSubmittedCall', confirmation.id, 'failed');
            onUpdate(confirmation, newFailedCall({ failed: true, id: confirmation.id }));
            return;
        }

        if (calls?.status === 'success' && hash) {
            log('NotSubmittedCall', confirmation.id, 'success', hash);

            const newConfirmation = newSubmittedTx({
                transactionHash: hash,
            });
            onUpdate(confirmation, newConfirmation);
            return watchTransaction(wagmiConfig, chain, newConfirmation, onUpdate);
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
        return watchTransaction(wagmiConfig, chain, confirmation, onUpdate);
    }

    if (isNotSubmittedSafeTx(confirmation)) {
        log('NotSubmittedSafeTx', confirmation.safeTransactionHash);
        const hash = await withTimeout(() => getOnchainHashFromSafeHash(chain, confirmation.safeTransactionHash), {
            timeout: 5000,
        }).catch(() => null);

        log('NotSubmittedSafeTx got onchain hash', hash);

        if (hash) {
            const newConfirmation = newSubmittedTx({ transactionHash: hash });
            onUpdate(confirmation, newConfirmation);
            return watchTransaction(wagmiConfig, chain, newConfirmation, onUpdate);
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
        return watchTransaction(wagmiConfig, chain, confirmation, onUpdate);
    }

    if (isSubmittedTx(confirmation)) {
        log('SubmittedTx', confirmation.transactionHash);
        const receipt = await waitForTransactionReceipt(wagmiConfig, {
            chainId: parseInt(chain.chainId),
            hash: confirmation.transactionHash as Hex,
            onReplaced: ({ transaction }: { transaction: { hash: string } }) => {
                log('SubmittedTx', confirmation.transactionHash, 'replaced', transaction.hash);
                onUpdate(
                    confirmation,
                    newSubmittedTx({
                        transactionHash: transaction.hash,
                    })
                );
            },
        })
            .catch(() =>
                getTransactionReceipt(wagmiConfig, {
                    chainId: parseInt(chain.chainId),
                    hash: confirmation.transactionHash as Hex,
                }).catch(() => null)
            )
            .catch(() => null);

        log('SubmittedTx resolved with receipt', receipt?.status);

        if (receipt?.status === 'reverted') {
            onUpdate(confirmation, {
                timestamp: Date.now(),
                status: TransactionStatus.Reverted,
                transactionHash: confirmation.transactionHash,
            });
        }

        if (receipt?.status === 'success') {
            onUpdate(confirmation, {
                timestamp: Date.now(),
                status: TransactionStatus.Confirmed,
                transactionHash: confirmation.transactionHash,
            });
        }
    }
};

const isTooOld = (timestamp: number) => {
    return timestamp < Date.now() - 1000 * 60 * 30;
};

export const useActivityEffects = () => {
    const { transactions } = useTransactions();
    const wagmiConfig = useConfig();
    // const notifyRelayApi = useNotifyRelayApi();
    const chains = useChains();

    const pendingTransactions = usePendingTransactions();
    const removeFinalising = useSetAtom(removeFinalisingAtom);
    const removeProving = useSetAtom(removeProvingAtom);
    const removePending = useSetAtom(removeTransactionByHashAtom);
    const removePendingById = useSetAtom(removeTransactionByIdAtom);
    // const pendingProves = usePendingProves();
    // const updatePendingProve = useSetAtom(updateProvingAtom);
    const pendingFinalises = usePendingFinalises();
    const updatePendingFinalise = useSetAtom(updateFinalisingAtom);
    const updateTransaction = useSetAtom(updateTransactionAtom);

    // handle updates from indexer
    useEffect(() => {
        transactions.forEach((tx: Transaction) => {
            const hash = getInitiatingHash(tx);
            if (hash) {
                removePending({ hash, newId: tx.id });
            }

            // if (isOptimismForcedWithdrawal(tx)) {
            //     if (tx.withdrawal?.prove) removeProving(tx.id);
            //     if (tx.withdrawal?.receive) removeFinalising(tx.id);
            //     return;
            // }

            // if (isOptimismWithdrawal(tx) && tx.prove) {
            //     removeProving(tx.id);
            // }

            if (tx.receive) removeFinalising(tx.id);
        });
    }, [transactions, removePending, removeProving, removeFinalising]);

    // watch previously submitted transactions
    useEffect(() => {
        pendingTransactions.map(async (b: Transaction) => {
            // const confirmation = isForcedWithdrawal(b) ? b.deposit.send : b.send;
            const confirmation = b.send;

            if (isTooOld(confirmation.timestamp)) {
                removePendingById(b.id);
                return;
            }

            // const fromChainId = isForcedWithdrawal(b) ? b.deposit.fromChainId : b.fromChainId;
            const fromChainId = b.fromChainId;
            const fromChain = chains.find((c) => c.chainId === fromChainId.toString());
            if (!fromChain) {
                return;
            }

            watchTransaction(wagmiConfig, fromChain, confirmation, (oldConfirmation, newConfirmation) => {
                updateTransaction({ oldConfirmation, newConfirmation });
            });
        });

        // pendingProves.map(
        //     ({ id, chainId, confirmation }: { id: string; chainId: number; confirmation: Confirmation }) => {
        //         if (isTooOld(confirmation.timestamp)) {
        //             removeProving(id);
        //             return;
        //         }

        //         const chain = chains.find((c) => c.chainId === chainId.toString());
        //         if (!chain) return;

        //         watchTransaction(wagmiConfig, chain, confirmation, (_oldConfirmation, newConfirmation) => {
        //             if (isFailedCall(newConfirmation) || isConfirmedFailedTx(newConfirmation)) {
        //                 removeProving(id);
        //             } else {
        //                 updatePendingProve({ id, confirmation: newConfirmation });
        //             }
        //         }).catch(() => null);
        //     },
        // );

        pendingFinalises.map(
            ({ id, chainId, confirmation }: { id: string; chainId: number; confirmation: Confirmation }) => {
                if (isTooOld(confirmation.timestamp)) {
                    removeFinalising(id);
                    return;
                }

                const chain = chains.find((c) => c.chainId === chainId.toString());
                if (!chain) return;

                watchTransaction(wagmiConfig, chain, confirmation, (_oldConfirmation, newConfirmation) => {
                    if (isFailedCall(newConfirmation) || isConfirmedFailedTx(newConfirmation)) {
                        removeFinalising(id);
                    } else {
                        updatePendingFinalise({ id, confirmation: newConfirmation });
                    }
                }).catch(() => null);
            }
        );
    }, [
        chains,
        pendingFinalises,
        pendingTransactions,
        removeFinalising,
        removePendingById,
        updatePendingFinalise,
        updateTransaction,
        wagmiConfig,
    ]);
};
