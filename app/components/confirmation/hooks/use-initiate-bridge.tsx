import { useSetAtom } from 'jotai';
import { toast } from 'sonner';
import { getAddress, zeroAddress } from 'viem';
import { useConfig } from 'wagmi';

import { useCapabilitiesQuery } from '@/hooks/account/use-is-contract-account';
import { useReceiveAmount } from '@/hooks/amount/use-receive-amount';
import { useWeiAmount } from '@/hooks/amount/use-wei-amount';
import { useAllowance } from '@/hooks/approvals/use-allowance';
import { useTokenBalances } from '@/hooks/balances/use-token-balances';
import { useBridge } from '@/hooks/bridge/use-bridge';
import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { useNativeToken } from '@/hooks/tokens/use-native-token';
import { watchTransaction } from '@/hooks/tx/use-activity-effects';
import { useFromChain } from '@/hooks/use-chains';
import { useTrackBridgeEvent } from '@/hooks/use-track-event';
import { useEvmAddress } from '@/hooks/wallets/use-evm-address';
import { useRecipient, useSender } from '@/hooks/wallets/use-recipient';
import { useSetBridgeSubmitted, waitingForBridgeSignatureAtom } from '@/service/stores/bridge.store';
import { addTransactionAtom, updateTransactionAtom } from '@/service/stores/local-txs.store';
import { useAddRejectedCallsUpdate } from '@/service/stores/setting.store';
import { useSelectedToken } from '@/service/stores/token.store';
import { isConfirmedFailedTx, isConfirmedSuccessTx, isFailedCall, isSubmittedTx } from '@/utils/guards';
import { isRouteQuote, isRouteWaitStep } from '@/utils/guards';
import { nativeTokenDecimalsTo18Decimals } from '@/utils/tokens/native-token-scaling';

import { useInitiatingChain, useInitiatingChainDto } from '../../../hooks/tx/use-initiating-chain-id';
import { useBuildPendingTx } from './use-build-pending-tx';

export const useInitiateBridge = () => {
    const trackBridgeEvent = useTrackBridgeEvent();

    const sender = useSender();
    const recipient = useRecipient();
    const from = useFromChain();
    const fromToken = useSelectedToken();
    const gasToken = useNativeToken();
    const weiAmount = useWeiAmount();
    const receive = useReceiveAmount();
    const route = useSelectedBridgeRoute();
    const initiatingChain = useInitiatingChain();
    const chainDto = useInitiatingChainDto();
    const wagmiConfig = useConfig();
    const evmAddress = useEvmAddress();

    const bridge = useBridge();
    const setWaitingForBridgeSignature = useSetAtom(waitingForBridgeSignatureAtom);
    const setBridgeSubmitted = useSetBridgeSubmitted();
    const savePendingTx = useBuildPendingTx();
    const addPendingTransaction = useSetAtom(addTransactionAtom);
    const updateTransaction = useSetAtom(updateTransactionAtom);
    const addRejectedCallsUpdate = useAddRejectedCallsUpdate();

    const capabilities = useCapabilitiesQuery();
    const allowance = useAllowance();
    const balances = useTokenBalances();

    return async () => {
        if (!sender || !initiatingChain || !recipient || !from || !isRouteQuote(route.data?.result)) {
            return;
        }

        try {
            setWaitingForBridgeSignature(true);

            const confirmation = await bridge();

            if (!confirmation) {
                return;
            }

            setBridgeSubmitted(true);

            if (isSubmittedTx(confirmation)) {
                trackBridgeEvent(route.data.id, confirmation.transactionHash);
            }

            const pending = savePendingTx(
                confirmation,
                fromToken?.address === zeroAddress
                    ? nativeTokenDecimalsTo18Decimals({
                          amount: weiAmount,
                          decimals: gasToken?.decimals ?? 18,
                      })
                    : weiAmount,
                BigInt(receive.data?.token.raw ?? '0'),
                route.data.id,
                route.data.result.steps.filter((s) => isRouteWaitStep(s)).reduce((accum, s) => s.duration + accum, 0),
                route.data.result.steps
            );
            if (pending) addPendingTransaction(pending);

            if (!chainDto) return;
            watchTransaction(wagmiConfig, chainDto, confirmation, (oldConfirmation, newConfirmation) => {
                if (!isConfirmedSuccessTx(newConfirmation)) {
                    updateTransaction({ oldConfirmation, newConfirmation });
                }

                if (isFailedCall(newConfirmation) || isConfirmedFailedTx(newConfirmation)) {
                    let providerName = pending?.provider || 'Unknown';
                    if (providerName.toLowerCase().endsWith(' bridge')) {
                        providerName = 'Native';
                    }
                    toast.error('Bridge failed', {
                        description: `Your ${providerName} bridge from ${from.name} failed. Please check transaction status in your wallet`,
                    });
                }
            });
        } catch (e: any) {
            if (evmAddress && e.message.includes('User rejected account upgrade')) {
                addRejectedCallsUpdate(getAddress(evmAddress));
            }

            capabilities.refetch();
            setWaitingForBridgeSignature(false);

            console.error(e);
        } finally {
            allowance.refetch();
            balances.refetch();
        }
    };
};
