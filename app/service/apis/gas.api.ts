import BigNumber from 'bignumber.js';

// import { log } from '@/utils/log';
import { rpcManager } from '@/utils/manager/rpc-manager';

import { GasEstimateRpcParams } from '../models/transaction.model';
import { sendEthereumRpcRequest } from './onchain.api';

export const DEFAULT_GAS_PRICE = 1500000000; // 1.5 gwei
export const DEFAULT_GAS_LIMIT = 50000; // 50000 gas for approve
export const DEFAULT_GAS = 500_000; // 500000 gas

export const PROVE_GAS = BigInt(500_000);
export const FINALIZE_GAS = BigInt(500_000);

const METAMASK_BLACK_LIST = ['173', '6912115', '1689', '689'];

/**
 * @description Calculate reasonable priority fee for different chains
 * @param chainId - chain id
 * @param baseGasPrice - base gas price in wei
 * @returns priority fee in wei
 */
export const calculatePriorityFee = (chainId: string, baseGasPrice: bigint): bigint => {
    // Priority fee calculation based on chain characteristics
    // Higher priority fees for congested chains, lower for L2s

    if (chainId === '1') {
        // Ethereum Mainnet - high congestion, use 2-3 gwei priority
        return BigInt(2000000000); // 2 gwei
    }
    if (chainId === '173') {
        // ENI - L1 chain, use 0.1 gwei priority
        return BigInt(1000000000); // 1 gwei
    } else if (chainId === '689') {
        // NERO - L1 chain, use 0.1 gwei priority
        return BigInt(1000000000); // 1 gwei
    } else {
        // Default priority fee: 10% of base gas price, minimum 0.001 gwei
        const calculatedPriority = baseGasPrice / 10n;
        const minPriority = BigInt(1000000000); // 1 gwei
        return calculatedPriority > minPriority ? calculatedPriority : minPriority;
    }
};

/**
 * @description Get suggested gas fees including priority fee from MetaMask API
 * @param chainId - chain id
 * @returns gas fees object with maxFeePerGas and maxPriorityFeePerGas
 */
export const getMetamaskGasFees = async (
    chainId: string
): Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint } | null> => {
    if (METAMASK_BLACK_LIST.includes(chainId)) {
        return null;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        const response = await fetch(`https://gas.api.cx.metamask.io/networks/${chainId}/suggestedGasFees`, {
            method: 'GET',
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data?.high) {
                const maxFeePerGas = BigInt(
                    new BigNumber(data.high.suggestedMaxFeePerGas).multipliedBy(10 ** 9).toFixed(0)
                );
                const maxPriorityFeePerGas = BigInt(
                    new BigNumber(data.high.suggestedMaxPriorityFeePerGas).multipliedBy(10 ** 9).toFixed(0)
                );

                return {
                    maxFeePerGas: checkMinGasPrice(chainId, maxFeePerGas),
                    maxPriorityFeePerGas: maxPriorityFeePerGas,
                };
            }
        }
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`${chainId} fetch request timed out after 30 seconds`);
        } else if (error instanceof Error) {
            console.error(`${chainId} get metamask suggestedGasFees fail`, error.message);
        } else {
            console.error(`${chainId} get metamask suggestedGasFees fail`, error);
        }
    }
    return null;
};

/**
 * @description get gas price from metamask
 * @param rpcs - array of rpc urls
 * @param chainId - chain id
 * @returns gas price
 */
export const getNetworkGasPrice = async (rpcs: string[], chainId: string) => {
    return rpcManager.executeRpcRequest(rpcs, async (rpc) => {
        const gasPrice = await sendEthereumRpcRequest(rpc, 'eth_gasPrice', []).then((data) => BigInt(data));
        const doubledGasPrice = gasPrice * 2n;

        // log('getNetworkGasPrice', chainId, doubledGasPrice, checkMinGasPrice(chainId, doubledGasPrice));
        return checkMinGasPrice(chainId, doubledGasPrice);
    });
};

/**
 * @description get gas price from network
 * @param rpcs - array of rpc urls
 * @param params - gas estimate params
 * @param chainId - chain id
 * @returns gas limit
 */
export const getNetworkGasLimit = async (rpcs: string[], params: GasEstimateRpcParams[], chainId: string) => {
    if (!params.length) return null;

    return rpcManager.executeRpcRequest(rpcs, async (rpc) => {
        const gasLimit = await sendEthereumRpcRequest(rpc, 'eth_estimateGas', params).then((data) => BigInt(data));
        const estimatedGasLimit = BigInt(Math.round(Number(gasLimit) * 1.5));

        // log('getNetworkGasLimit', chainId, estimatedGasLimit, checkMinGasLimit(chainId, estimatedGasLimit));
        return checkMinGasLimit(chainId, estimatedGasLimit);
    });
};

export const checkMinGasPrice = (chainId: string, gasPrice: bigint | number): bigint => {
    let _gasPrice = gasPrice as bigint;

    if (typeof gasPrice === 'number') {
        _gasPrice = BigInt(Math.round(gasPrice));
    }

    // Set minimum gas prices for different chains based on their network characteristics
    // These values ensure transactions are processed within reasonable timeframes
    // Values are in wei (1 gwei = 10^9 wei)

    if (chainId === '173' && BigInt(300000000) > _gasPrice) {
        // ENI - L1 chain, minimum ~0.3 gwei
        return BigInt(300000000);
    } else if (chainId === '10' && BigInt(150000000) > _gasPrice) {
        // Optimism - L2 chain with low gas prices, minimum 0.15 gwei
        return BigInt(150000000);
    } else if (chainId === '167000' && BigInt(3008847186) > _gasPrice) {
        // Taiko - L2 chain, minimum ~3 gwei
        return BigInt(3008847186);
    } else if (chainId === '534352' && BigInt(106550310) > _gasPrice) {
        // Scroll - L2 chain, minimum ~0.1 gwei
        return BigInt(106550310);
    } else if (chainId === '324' && BigInt(28825000) > _gasPrice) {
        // ZKSyncEra - L2 chain, minimum ~0.029 gwei
        return BigInt(28825000);
    } else if (chainId === '137' && BigInt(2696144336220) > _gasPrice) {
        // Polygon - L1 chain, minimum ~2.7 gwei
        return BigInt(2696144336220);
    } else if (chainId === '56' && BigInt(4589889321118) > _gasPrice) {
        // BSC - L1 chain, minimum ~4.6 gwei
        return BigInt(4589889321118);
    } else if (chainId === '1625' && BigInt(1800000000000) > _gasPrice) {
        // Gravity - L1 chain, minimum ~1.8 gwei
        return BigInt(1800000000000);
    } else if (chainId === '200901' && BigInt(30000007) > _gasPrice) {
        // Bitlayer - L1 chain, minimum ~0.03 gwei
        return BigInt(30000007);
    } else if (chainId === '122' && BigInt(23880000000) > _gasPrice) {
        // Fuse - L1 chain, minimum ~0.024 gwei
        return BigInt(23880000000);
    } else if (chainId === '7000' && BigInt(10302000000) > _gasPrice) {
        // ZetaChain - cross-chain platform, minimum ~10.3 gwei
        return BigInt(10302000000);
    } else if (BigInt(DEFAULT_GAS_PRICE) > _gasPrice) {
        // Default minimum gas price for any chain (1.5 gwei)
        // This ensures transactions are processed in most networks
        return BigInt(DEFAULT_GAS_PRICE);
    }
    return _gasPrice;
};

export const checkMinGasLimit = (chainId: string, gasLimit: bigint | number): bigint => {
    let _gasLimit = gasLimit as bigint;

    if (typeof gasLimit === 'number') {
        _gasLimit = BigInt(Math.round(gasLimit));
    }

    // Set minimum gas limits based on chain characteristics
    // L2 chains typically have lower minimums due to their architecture
    // L1 chains may require higher minimums for complex operations

    if (chainId === '173' && BigInt(100000) > _gasLimit) {
        // ENI - L1 chain, minimum ~0.1 gwei
        return BigInt(100000);
    } else if (chainId === '10' && BigInt(15000) > _gasLimit) {
        // Optimism - L2 chain, optimized for lower gas usage
        return BigInt(25000);
    } else if (chainId === '56' && BigInt(22000) > _gasLimit) {
        // BSC - L1 chain, standard minimum
        return BigInt(25000);
    } else if (BigInt(DEFAULT_GAS_LIMIT) > _gasLimit) {
        // Default minimum for any chain (standard ETH transfer)
        return BigInt(DEFAULT_GAS_LIMIT);
    }
    return _gasLimit;
};
