import { useSetAtom } from 'jotai';

import {
    approveConfirmationAtom,
    bridgeSubmittedAtom,
    waitingForApproveSignatureAtom,
    waitingForBridgeSignatureAtom,
} from '../stores/bridge.store';

export const useReset = () => {
    const resetApproveConfirmation = useSetAtom(approveConfirmationAtom);
    const resetBridgeSubmitted = useSetAtom(bridgeSubmittedAtom);
    const resetWaitingForBridgeSignature = useSetAtom(waitingForBridgeSignatureAtom);
    const resetWaitingForApproveSignature = useSetAtom(waitingForApproveSignatureAtom);

    return () => {
        resetApproveConfirmation(null);
        resetBridgeSubmitted(false);
        resetWaitingForBridgeSignature(false);
        resetWaitingForApproveSignature(false);
    };
};
