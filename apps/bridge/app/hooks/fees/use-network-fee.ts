import { useBridgeGasEstimateForRoute } from '@/hooks/fees/use-bridge-gas-estimate';
import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { RouteStepTransactionDto } from '@/service/models/route.model';
import { isRouteQuote } from '@/utils/guards';
// import { log } from '@/utils/log';
import { scaleToNativeTokenDecimals } from '@/utils/tokens/native-token-scaling';

import { useGetFormattedAmount } from '../amount/use-get-formatted-amount';
import { useNativeTokenForChainId } from '../tokens/use-native-token';
import { useChain } from '../use-chains';
import { useGasPrice } from './use-gas-estimate';

export const useNetworkFee = () => {
    const route = useSelectedBridgeRoute();
    const gasEstimate = useBridgeGasEstimateForRoute(route.data);

    const chainId = isRouteQuote(route.data?.result)
        ? (route.data.result.steps[0] as RouteStepTransactionDto).chainId
        : undefined;

    return useNetworkFeeForGasLimit(chainId, gasEstimate.data);
};

export const useNetworkFeeForGasLimit = (chainId: string | undefined, gasLimit: number | bigint | undefined | null) => {
    const chain = useChain(chainId);
    const nativeToken = useNativeTokenForChainId(chainId);
    const getFormattedAmount = useGetFormattedAmount(nativeToken);
    const { data: gasPrice, isLoading: isLoadingGasPrice } = useGasPrice(chain);

    // log('gas=limit*price', chainId, gasLimit, gasPrice);

    if (!chainId || !gasLimit) {
        return {
            isLoading: true,
            data: null,
        };
    }

    const fee = gasPrice ? gasPrice : BigInt(0);
    const gwei = fee * BigInt(Math.round(Number(gasLimit)));

    const amount = scaleToNativeTokenDecimals({
        amount: gwei,
        decimals: nativeToken?.decimals ?? 18,
    }).toString();

    return {
        isLoading: isLoadingGasPrice,
        data: getFormattedAmount(amount),
    };
};
