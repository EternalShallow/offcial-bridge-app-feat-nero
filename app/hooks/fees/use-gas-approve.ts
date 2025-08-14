import { DEFAULT_GAS_LIMIT } from '@/service/apis/gas.api';
import { ChainDto } from '@/service/models/chain.model';
import { GasEstimateRpcParams } from '@/service/models/transaction.model';

import { useGasLimit } from './use-gas-estimate';

export const useGasApprove = (chain: ChainDto | null, approvalItem: GasEstimateRpcParams | null) => {
    const transactionParams = approvalItem
        ? [
              {
                  data: approvalItem.data,
                  to: approvalItem.to,
                  from: approvalItem.from,
                  value: approvalItem.value,
              },
          ]
        : [];
    const { data: gasLimit, isLoading, isError } = useGasLimit(chain, transactionParams);

    return {
        data: gasLimit ?? DEFAULT_GAS_LIMIT,
        isLoading,
        isError,
    };
};
