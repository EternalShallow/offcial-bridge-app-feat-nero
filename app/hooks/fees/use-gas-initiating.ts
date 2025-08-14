import { DEFAULT_GAS } from '@/service/apis/gas.api';
import { ChainDto } from '@/service/models/chain.model';
import { RouteResultDto } from '@/service/models/route.model';
import { GasEstimateRpcParams } from '@/service/models/transaction.model';
import { formatTxValueSafe } from '@/utils/format-value';

import { useGasLimit } from './use-gas-estimate';

export const useGasInitiating = (
    route: RouteResultDto | null,
    chain: ChainDto | null,
    initiatingItem: GasEstimateRpcParams | null
) => {
    // Prepare transaction params for gas estimation (always call hook)
    const transactionParams = initiatingItem
        ? [
              {
                  data: initiatingItem.data,
                  to: initiatingItem.to,
                  from: initiatingItem.from,
                  value: formatTxValueSafe(initiatingItem.value),
              },
          ]
        : [];

    // Use the useGasLimit hook for RPC gas estimation (always call hook)
    const gasLimitQuery = useGasLimit(chain, transactionParams);

    // route gas limit
    // const initiateTx = route?.result?.steps?.find((step) => step.type === RouteStepType.Initiate) as
    //     | RouteStepTransactionDto
    //     | undefined;

    // if (initiateTx?.estimatedGasLimit && initiateTx.estimatedGasLimit > 0) {
    //     return {
    //         data: Math.round(initiateTx.estimatedGasLimit),
    //         isLoading: false,
    //         isError: false,
    //     };
    // }

    // If no chain or initiating item, return default
    if (!chain || !initiatingItem || !initiatingItem.from) {
        return {
            data: DEFAULT_GAS,
            isLoading: false,
            isError: false,
        };
    }

    return {
        data: gasLimitQuery.data ? Number(gasLimitQuery.data) : DEFAULT_GAS,
        isLoading: gasLimitQuery.isLoading,
        isError: gasLimitQuery.isError,
    };
};
