import { useInitiatingTx } from '@/hooks/tx/use-initiating-tx';
import { useTxDuration } from '@/hooks/tx/use-tx-duration';
import { useTxFromTo } from '@/hooks/tx/use-tx-from-to';
import { MessageStatus, Transaction } from '@/service/models/transaction.model';
import { isConfirmedTx, isForcedWithdrawal, isWithdrawal } from '@/utils/guards';

type ActionStatus = { description: string; button: string };
type WaitStatus = { description: string; timestamp: number };
type GeneralStatus = { description: string };
type NoStatus = null;

type Status = ActionStatus | WaitStatus | NoStatus | GeneralStatus;

export const isActionStatus = (x: Status): x is ActionStatus => {
    return !!(x as ActionStatus | NoStatus)?.button;
};

export const isWaitStatus = (x: Status): x is WaitStatus => {
    return !!(x as WaitStatus | NoStatus)?.timestamp;
};

export const isGeneralStatus = (x: Status): x is GeneralStatus => {
    return !!(x as GeneralStatus)?.description;
};

const useNextStateChangeTimestamp = (tx: Transaction) => {
    const initiatingTx = useInitiatingTx(tx);
    const duration = useTxDuration(tx);

    if (!initiatingTx) {
        return null;
    }

    if (!isConfirmedTx(initiatingTx)) {
        return {
            description: 'Submitting bridge',
        };
    }

    // if (isOptimismWithdrawal(tx) || isOptimismForcedWithdrawal(tx)) {
    //     if (isOptimismForcedWithdrawal(tx) && !tx.withdrawal) {
    //         return {
    //             description: 'Waiting for rollup withdrawal',
    //             timestamp: initiatingTx.timestamp + (deployment?.depositDuration ?? 0),
    //         };
    //     }

    //     const withdrawal = isOptimismWithdrawal(tx) ? tx : tx.withdrawal;
    //     const status = isOptimismWithdrawal(tx) ? tx.status : tx.withdrawal?.status;
    //     if (!withdrawal || !status) {
    //         return null;
    //     }

    //     if (status === MessageStatus.STATE_ROOT_NOT_PUBLISHED && isConfirmedTx(withdrawal.send)) {
    //         return {
    //             description:
    //                 !!deployment && isOptimism(deployment) && deployment?.contractAddresses.disputeGameFactory
    //                     ? 'Waiting for dispute game'
    //                     : 'Waiting for state root',

    //             timestamp: withdrawal.send.timestamp + (deployment?.proveDuration ?? 0),
    //         };
    //     }

    //     if (withdrawal.prove && status === MessageStatus.IN_CHALLENGE_PERIOD) {
    //         return {
    //             description: 'Challenge period',
    //             timestamp: withdrawal.prove.timestamp + (deployment?.finalizeDuration ?? 0),
    //         };
    //     }

    //     return null;
    // }

    const description = `Waiting for confirmation`;

    return {
        timestamp: initiatingTx.timestamp + (duration ?? 0),
        description,
    };
};

export const useAction = (tx: Transaction) => {
    // console.log('[useAction]', tx);

    if (isWithdrawal(tx) || isForcedWithdrawal(tx)) {
        const status = tx.status; // tx.withdrawal?.status
        if (!status) {
            return null;
        }

        return status === MessageStatus.Provable ? 'prove' : status === MessageStatus.Claimable ? 'finalize' : null;
    }

    // if (isArbitrumWithdrawal(tx)) {
    //     return tx.status === ArbitrumMessageStatus.CONFIRMED ? 'finalize' : null;
    // }

    // if (isCctpBridge(tx) && isConfirmedSuccessTx(tx.send)) {
    //     return tx.send.timestamp + tx.duration < Date.now() ? 'mint' : null;
    // }

    return null;
};

export const useStatus = (tx: Transaction): Status => {
    const action = useAction(tx);
    const chains = useTxFromTo(tx);
    const nextStateChangeTimestamp = useNextStateChangeTimestamp(tx);

    if (!chains) {
        return null;
    }

    // console.log('[action]', action, nextStateChangeTimestamp);

    if (action === 'prove') {
        return {
            description: `Ready to prove`,
            button: 'Prove',
        };
    }

    if (action === 'finalize') {
        return {
            description: `Ready to finalize`,
            button: 'Claim',
        };
    }

    if (action === 'mint') {
        return {
            description: `Ready to mint`,
            button: 'Get',
        };
    }

    return nextStateChangeTimestamp;
};
