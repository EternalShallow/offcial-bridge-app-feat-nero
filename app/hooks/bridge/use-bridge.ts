import { isPresent } from 'ts-is-present';
import { Address, Hex } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';

import { useBridgeGasEstimate } from '@/hooks/fees/use-bridge-gas-estimate';
import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { useInitiatingChain, useInitiatingChainDto } from '@/hooks/tx/use-initiating-chain-id';
import { useSwitchChain } from '@/hooks/wallets/use-switch-chain';
import { isRouteQuote } from '@/utils/guards';

// import { log } from '@/utils/log';

import { useSupportsSendCalls } from '../account/use-is-contract-account';
import { useApproveTx } from '../approvals/use-approve-tx';
import { useGasFees } from '../fees/use-gas-estimate';
import { useSubmitTransactionEvm } from '../tx/use-tx-submit';

export const useBridgeEvm = () => {
    const account = useAccount();
    const wallet = useWalletClient();
    const switchChain = useSwitchChain();
    const selectedRoute = useSelectedBridgeRoute();
    const initiatingChain = useInitiatingChain();
    const initiatingChainDto = useInitiatingChainDto();
    const approveTx = useApproveTx(selectedRoute.data);
    const submitTransaction = useSubmitTransactionEvm(initiatingChain);
    const supportsSendCalls = useSupportsSendCalls();

    // gas
    const { data: gasFees } = useGasFees(initiatingChainDto);
    const { data: gas } = useBridgeGasEstimate();

    const route = isRouteQuote(selectedRoute?.data?.result) ? selectedRoute.data.result : undefined;
    const tx = route?.initiatingTransaction;

    return async () => {
        const params: any = {};

        if (tx && gas) {
            params.data = tx.data as Hex;
            params.to = tx.to as Address;
            params.chainId = parseInt(tx.chainId);
            params.value = BigInt(tx.value);
            params.gas = BigInt(Math.round(gas));

            // Handle gas fees based on wallet compatibility
            if (gasFees) {
                // Wallets can use EIP-1559 fees
                params.maxFeePerGas = gasFees.maxFeePerGas;
                params.maxPriorityFeePerGas = gasFees.maxPriorityFeePerGas;
            } else {
                // Fallback to legacy gas price calculation
                const fallbackGasPrice = BigInt(2000000000); // 2 gwei
                params.gasPrice = fallbackGasPrice;
            }
        }

        // log('【useBridgeEvm】 Prepared params', params);

        if (!params.gas || !initiatingChain || !wallet.data) {
            return;
        }

        if (initiatingChain.id !== account.chainId || initiatingChain.id !== wallet.data.chain.id) {
            await switchChain(initiatingChain);
        }

        const calls = [approveTx, params].filter(isPresent); // approveGasTokenTx

        if (
            supportsSendCalls &&
            calls.length > 1
            // selectedRoute.data?.id !== RouteProvider.EniForcedWithdrawal
        ) {
            return submitTransaction(calls);
        }

        return submitTransaction(params);
    };
};

export const useBridge = () => {
    return useBridgeEvm();
};
