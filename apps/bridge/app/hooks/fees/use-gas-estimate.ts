import { useQuery } from '@tanstack/react-query';

import {
    calculatePriorityFee,
    getMetamaskGasFees,
    getNetworkGasLimit,
    getNetworkGasPrice,
} from '@/service/apis/gas.api';
import { ChainDto } from '@/service/models/chain.model';
import { GasEstimateRpcParams } from '@/service/models/transaction.model';

// import { log } from '@/utils/log';

export type GasEstimate = {
    fee: string;
    feeToken: string;
    price: string;
    limit: string;
    chainId: string;
};

export type GasFees = {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
};

// TODO: fees.data?.gasPrice ? { gasPrice: fees.data?.gasPrice } : { maxFeePerGas: fees.data?.maxFeePerGas, maxPriorityFeePerGas: fees.data?.maxPriorityFeePerGas }
export const useGasPrice = (chain: ChainDto | null | undefined) => {
    return useQuery({
        queryKey: ['gasPrice', chain?.chainId],
        queryFn: () => {
            if (!chain) return null;
            return getGasPrice(chain);
        },
        enabled: !!chain,
        staleTime: 1000 * 15, // 15 seconds - gas price changes frequently
        gcTime: 1000 * 30, // 30 seconds - keep in cache longer
    });
};

/**
 * @description Get complete gas fees including priority fees for EIP-1559 transactions
 */
export const useGasFees = (chain: ChainDto | null | undefined) => {
    return useQuery({
        queryKey: ['gasFees', chain?.chainId],
        queryFn: async () => {
            if (!chain) return null;
            return getGasFees(chain);
        },
        enabled: !!chain,
        staleTime: 1000 * 15, // 15 seconds - gas fees change frequently
        gcTime: 1000 * 30, // 30 seconds - keep in cache longer
    });
};

export const useGasLimit = (chain: ChainDto | null | undefined, transactions: GasEstimateRpcParams[]) => {
    return useQuery({
        queryKey: ['gasLimit', chain?.chainId, transactions],
        queryFn: () => {
            if (!chain) return null;
            if (!transactions.length) return null;
            return getGasLimit(chain, transactions);
        },
        enabled: !!chain && !!transactions && transactions.length > 0,
        staleTime: 1000 * 30, // Increased to 30 seconds, gas limit is relatively stable
        gcTime: 1000 * 120, // Increased to 2 minutes to extend cache time
        // Add retry mechanism
        retry: (failureCount, error) => {
            // Retry up to 3 times
            return failureCount < 3;
        },
        // Add retry delay
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

/**
 * @description get gas fees including priority fees
 * @param chain - chain
 * @returns gas fees
 */
export const getGasFees = async (chain: ChainDto): Promise<GasFees | null> => {
    try {
        // Try to get gas fees from MetaMask API first
        const metamaskFees = await getMetamaskGasFees(chain.chainId);
        if (metamaskFees) {
            // log('getGasFees from MetaMask', chain.chainId, metamaskFees);
            return metamaskFees;
        }

        // Fallback to network gas price and calculate priority fee
        if (!chain.rpc?.length) return null;
        const networkGasPrice = await getNetworkGasPrice(chain.rpc, chain.chainId);

        if (networkGasPrice) {
            const priorityFee = calculatePriorityFee(chain.chainId, networkGasPrice);
            const gasFees = {
                maxFeePerGas: networkGasPrice * 2n, // Double the base price for max fee
                maxPriorityFeePerGas: priorityFee,
            };
            // log('getGasFees calculated', chain.chainId, gasFees);
            return gasFees;
        }

        return null;
    } catch (error) {
        console.error(`Failed to get gas fees for chain ${chain?.chainId}:`, error);
        return null;
    }
};

/**
 * @description get gas price
 * @param chain - chain
 * @returns gas price
 */
export const getGasPrice = async (chain: ChainDto): Promise<bigint | null> => {
    try {
        // Try to get gas fees from MetaMask API first
        const metamaskFees = await getMetamaskGasFees(chain.chainId);
        if (metamaskFees) return metamaskFees.maxFeePerGas;

        // If MetaMask API failed, get gas price from network
        if (!chain.rpc?.length) return null;
        const networkGasPrice = await getNetworkGasPrice(chain.rpc, chain.chainId);

        // log('getGasPrice', chain.chainId, networkGasPrice);

        return networkGasPrice;
    } catch (error) {
        console.error(`Failed to get gas price for chain ${chain?.chainId}:`, error);
        return null;
    }
};

/**
 * @description get gas limit
 * @param chain - chain
 * @param transaction - transaction
 * @returns gas limit
 */
export const getGasLimit = async (chain: ChainDto, transaction: GasEstimateRpcParams[]): Promise<bigint | null> => {
    try {
        // check input params
        if (!chain?.rpc?.length || !transaction?.length) {
            return null;
        }

        // get gas limit
        const gasLimit = await getNetworkGasLimit(chain.rpc, transaction, chain.chainId);
        return gasLimit ?? null;
    } catch (error) {
        console.error(`Failed to get gas limit for chain ${chain.chainId}:`, error);
        return null;
    }
};

// export const useGasEstimate = () => {
//     return async (from: ChainDto | null, transaction: TransactionForGasEstimate[]): Promise<GasEstimate | null> => {
//         if (!from) return null;

//         const gasPrice = await getGasPrice(from);
//         if (!gasPrice) return null;

//         const gasLimit = await getGasLimit(from, transaction);
//         if (!gasLimit) return null;

//         const transactionFee = gasLimit * gasPrice;

//         return {
//             fee: new BigNumber(transactionFee.toString()).div(10 ** from.nativeCurrency.decimals).toFixed(18),
//             feeToken: from.nativeCurrency.symbol,
//             price: gasPrice.toString(),
//             limit: gasLimit.toString(),
//             chainId: from.chainId,
//         };
//     };
// };
