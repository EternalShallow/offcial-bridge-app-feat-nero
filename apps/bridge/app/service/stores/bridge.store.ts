import { atom, useAtomValue, useSetAtom } from 'jotai';

import { Confirmation } from '@/service/models/transaction.model';

/**
 * App state
 */
export const fromChainIdAtom = atom<number>();
export const useFromChainId = () => useAtomValue(fromChainIdAtom);
export const useSetFromChainId = () => useSetAtom(fromChainIdAtom);

export const toChainIdAtom = atom<number>();
export const useToChainId = () => useAtomValue(toChainIdAtom);
export const useSetToChainId = () => useSetAtom(toChainIdAtom);

export const rawAmountAtom = atom('');
export const useRawAmount = () => useAtomValue(rawAmountAtom);
export const useSetRawAmount = () => useSetAtom(rawAmountAtom);

export const isWrapAtom = atom<boolean>(true);
export const useIsWrap = () => useAtomValue(isWrapAtom);
export const useSetIsWrap = () => useSetAtom(isWrapAtom);

// display transactions
export const displayTransactionsAtom = atom<boolean>(false);
export const useDisplayTransactions = () => useAtomValue(displayTransactionsAtom);
export const useSetDisplayTransactions = () => useSetAtom(displayTransactionsAtom);

/**
 * Bridge state
 */

// Step1-1: approve confirmation
export const approveConfirmationAtom = atom<Confirmation | null>(null);
export const useApproveConfirmation = () => useAtomValue(approveConfirmationAtom);
export const useSetApproveConfirmation = () => useSetAtom(approveConfirmationAtom);

// Step1-2: waiting for approve signature
export const waitingForApproveSignatureAtom = atom<boolean>(false);
export const useWaitingForApproveSignature = () => useAtomValue(waitingForApproveSignatureAtom);
export const useSetWaitingForApproveSignature = () => useSetAtom(waitingForApproveSignatureAtom);

// Step2-1: bridge submitted
export const bridgeSubmittedAtom = atom<boolean>(false);
export const useBridgeSubmitted = () => useAtomValue(bridgeSubmittedAtom);
export const useSetBridgeSubmitted = () => useSetAtom(bridgeSubmittedAtom);

// Step2-2: waiting for bridge signature
export const waitingForBridgeSignatureAtom = atom<boolean>(false);
export const useWaitingForBridgeSignature = () => useAtomValue(waitingForBridgeSignatureAtom);
export const useSetWaitingForBridgeSignature = () => useSetAtom(waitingForBridgeSignatureAtom);
