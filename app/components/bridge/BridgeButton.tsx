import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { useIsContractAccountOnChain } from '@/hooks/account/use-is-contract-account';
import { useWeiAmount } from '@/hooks/amount/use-wei-amount';
import { useGasBalance } from '@/hooks/balances/use-gas-balance';
import { useHasInsufficientBalance } from '@/hooks/balances/use-has-insufficient-balance';
import { useBridgeGasEstimateData, useBridgeGasEstimateStatus } from '@/hooks/fees/use-bridge-gas-estimate';
import { useNetworkFee } from '@/hooks/fees/use-network-fee';
import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { useNativeToken } from '@/hooks/tokens/use-native-token';
import { useInitiatingChain, useInitiatingChainDto } from '@/hooks/tx/use-initiating-chain-id';
import { useFromChain, useToChain } from '@/hooks/use-chains';
import { useIsWithdrawal } from '@/hooks/use-is-withdrawal';
import { useModal } from '@/hooks/use-modal';
import { useTrackEvent } from '@/hooks/use-track-event';
import { useEvmAddress } from '@/hooks/wallets/use-evm-address';
import { useEvmWalletModal } from '@/hooks/wallets/use-evm-wallet-modal';
import { useRecipient } from '@/hooks/wallets/use-recipient';
import { isRouteQuote } from '@/utils/guards';

import { Button } from '../ui/button';

interface SubmitButton {
    onSubmit: () => void;
    buttonText: string;
    disabled: boolean;
    extra?: {
        text: string;
        onClick: () => void;
    };
}

export const BridgeButton = () => {
    const { t } = useTranslation();
    const trackEvent = useTrackEvent();
    const route = useSelectedBridgeRoute();
    const from = useFromChain();
    const to = useToChain();
    const weiAmount = useWeiAmount();
    const sender = useEvmAddress();
    const recipient = useRecipient();
    const nativeToken = useNativeToken();
    const initiatingChain = useInitiatingChain();
    const initiatingChainDto = useInitiatingChainDto();
    const isContractAccountOnInitiatingChain = useIsContractAccountOnChain(initiatingChainDto);

    // Balance
    const fromEthBalance = useGasBalance(initiatingChain?.id);
    const hasInsufficientBalance = useHasInsufficientBalance();

    // Gas
    const estimateData = useBridgeGasEstimateData();
    const networkFee = useNetworkFee();
    const estimateStatus = useBridgeGasEstimateStatus();
    const hasInsufficientGas = useMemo(() => {
        if (estimateData.data?.insufficientGas) {
            return true;
        }
        if (!networkFee.data || !fromEthBalance.data || !isRouteQuote(route.data?.result)) {
            return false;
        }
        const availableGasBalance = fromEthBalance.data - BigInt(route.data.result.initiatingTransaction.value);
        return availableGasBalance < BigInt(networkFee.data.token.raw);
    }, [estimateData.data, networkFee.data, fromEthBalance.data, route.data]);

    // Modal
    const confirmationModal = useModal('Confirmation');
    const evmWalletModal = useEvmWalletModal();

    const isWithdraw = useIsWithdrawal();
    const handleSubmitClick = () => {
        confirmationModal.open();

        if (isWithdraw) {
            trackEvent({ event: 'click-withdraw', name: to?.name || '' });
        } else {
            trackEvent({ event: 'click-deposit', name: to?.name || '' });
        }
    };

    const submitButton: SubmitButton = match({
        weiAmount,
        sender,
        recipient,
        hasInsufficientBalance,
        hasInsufficientGas,
        estimateStatus,
        isContractAccountOnInitiatingChain,
        routeLoading: route.isLoading,
        routeError: route.isError,
        // routeErrorMsg: route.error?.message,
        validRoute: route.data && isRouteQuote(route.data.result),
    })
        .with({ sender: undefined, recipient: undefined }, () => ({
            onSubmit: evmWalletModal.open!,
            buttonText: t('connectWallet'),
            disabled: false,
        }))
        .with({ sender: undefined }, () => ({
            onSubmit: evmWalletModal.open!,
            buttonText: t('connectChainWallet', { chain: from?.name }),
            disabled: false,
        }))
        .with({ weiAmount: BigInt('0') }, () => ({
            onSubmit: () => {},
            buttonText: t('enterAnAmount'),
            disabled: true,
        }))
        .with({ hasInsufficientBalance: true }, () => ({
            onSubmit: () => {},
            buttonText: t('insufficientFunds'),
            disabled: true,
        }))
        .with({ hasInsufficientGas: true }, () => ({
            onSubmit: handleSubmitClick,
            buttonText: t('insufficientGas', {
                symbol: nativeToken?.symbol,
            }),
            // Let's not disable here because people could actually submit with
            // a lower gas price via their wallet. A little power-usery but important imo
            // temp disable before we ship a better gas estimation flow
            disabled: true,
        }))
        .with({ estimateStatus: { data: false } }, () => ({
            onSubmit: () => {},
            buttonText: 'This bridge is likely to fail',
            disabled: true,
        }))
        .with(
            { isContractAccountOnInitiatingChain: true }, // isForcedWithdrawal: true
            () => ({
                onSubmit: () => {},
                buttonText: 'Escape hatch not available for smart accounts',
                disabled: true,
            })
        )
        // .with({ routeError: true }, (d) => ({
        //     onSubmit: () => {},
        //     buttonText: d.routeErrorMsg || 'Quote error',
        //     disabled: true,
        // }))
        .otherwise((d) => ({
            onSubmit: handleSubmitClick,
            buttonText: t('reviewBridge'),
            disabled: d.routeLoading || d.routeError || !d.validRoute || d.estimateStatus.isFetching,
        }));

    return (
        <div className="flex flex-col gap-1 mt-2">
            <Button disabled={submitButton.disabled} onClick={submitButton.onSubmit} className="hover:scale-[1.02]">
                {submitButton.buttonText}
            </Button>

            {/* {!!submitButton.extra && (
                <Button
                    onClick={submitButton.extra.onClick}
                    size={'xs'}
                    variant={'link'}
                    className="text-muted-foreground hover:bg-transparent"
                >
                    {submitButton.extra.text}
                </Button>
            )} */}
        </div>
    );
};
