import { useState } from 'react';

import { Chain } from 'viem';
import { useAccount, useSendCalls, useSendTransaction, useWalletClient } from 'wagmi';

import { newNotSubmittedCall, newNotSubmittedSafeTx, newSubmittedTx } from '@/service/models/transaction.model';
import { isSafeTx } from '@/utils/tx/wait-for-safe-tx';

import { useIsContractAccount, useSupportsSendCalls } from '../account/use-is-contract-account';
import { useSwitchChain } from '../wallets/use-switch-chain';

export const useSubmitTransactionEvm = (chain: Chain | null | undefined) => {
    const account = useAccount();
    const wallet = useWalletClient();
    const switchChain = useSwitchChain();
    const { sendTransactionAsync } = useSendTransaction();
    const isContractAccount = useIsContractAccount();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supportsSendCalls = useSupportsSendCalls();
    const { sendCallsAsync } = useSendCalls();

    return async (params: any) => {
        if (!chain || !wallet.data) return;

        if (isSubmitting) {
            console.log('Transaction already in progress, skipping...');
            return;
        }

        if (chain?.id !== account.chainId || chain?.id !== wallet.data?.chain.id) {
            await switchChain(chain);
        }

        try {
            setIsSubmitting(true);

            if (supportsSendCalls && Array.isArray(params) && params.length > 1) {
                const { id } = await sendCallsAsync({
                    calls: params,
                    forceAtomic: true,
                });

                return newNotSubmittedCall({ id });
            }

            const hash = await sendTransactionAsync(params);

            if (isContractAccount && (await isSafeTx(chain.id, hash))) {
                return newNotSubmittedSafeTx({
                    safeTransactionHash: hash,
                });
            }

            return newSubmittedTx({ transactionHash: hash });
        } finally {
            setIsSubmitting(false);
        }
    };
};

// export const useSubmitTransactionSvm = (chain: ChainDto | null) => {
//   const { connection } = useConnection();
//   const { sendTransaction } = useWallet();

//   return async (params: string) => {
//     const [
//       {
//         context: { slot: minContextSlot },
//         value: { blockhash, lastValidBlockHeight },
//       },
//     ] = await Promise.all([
//       connection.getLatestBlockhashAndContext("confirmed"),
//     ]);

//     let tx: Transaction | VersionedTransaction | null = null;

//     try {
//       tx = Transaction.from(Buffer.from(params, "base64"));
//     } catch {}
//     try {
//       tx = VersionedTransaction.deserialize(
//         new Uint8Array(Buffer.from(params, "base64"))
//       );
//     } catch {}

//     if (!tx) {
//       throw new Error("Invalid transaction");
//     }

//     const signature = await sendTransaction(tx, connection, {
//       minContextSlot,
//       preflightCommitment: "confirmed",
//       skipPreflight: true,
//     });

//     return newSubmittedTx({
//       transactionHash: signature,
//       svm: {
//         blockhash,
//         lastValidBlockHeight,
//         signature,
//       },
//     });
//   };
// };
