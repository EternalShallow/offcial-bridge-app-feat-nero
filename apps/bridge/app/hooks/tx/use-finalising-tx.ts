import { useMutation } from '@tanstack/react-query';

import { getFinaliseTransaction } from '@/service/apis/activity.api';
import { Transaction } from '@/service/models/transaction.model';

// import { isForcedWithdrawal } from "@/utils/guards";

export const useFinalisingTx = (tx: Transaction | undefined) => {
    if (!tx) return null;
    // if (isForcedWithdrawal(tx)) return tx.withdrawal?.receive;
    return tx.receive;
};

export const useGetFinaliseTransaction = () => {
    return useMutation({
        mutationFn: (id: string) => getFinaliseTransaction({ id }),
        // onSuccess: (data) => {
        //     console.log('finaliseTransaction', data);
        // },
    });
};
