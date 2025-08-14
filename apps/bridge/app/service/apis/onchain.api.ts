import { safeTransactionServiceEndpoints } from '@/common/consts/network/safe';

import { ChainDto } from '../models/chain.model';
import { SafeMultisigTransactionsResult } from '../models/onchain.model';

/**
 * Get the Safe transaction payload from the Safe Transaction Service
 * @param chainId - The chain ID
 * @param hash - The transaction hash
 * @returns The Safe transaction payload or null if not found
 */
const getSafeTxPayload = async (chainId: number, hash: string): Promise<SafeMultisigTransactionsResult | null> => {
    const transactionServiceEndpoint = safeTransactionServiceEndpoints[chainId];
    if (!transactionServiceEndpoint) return null;

    try {
        const response = await fetch(`${transactionServiceEndpoint}/api/v2/multisig-transactions/${hash}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) return null;

        const result = (await response.json()) as SafeMultisigTransactionsResult;
        return result;
    } catch (error) {
        console.error('Failed to fetch Safe transaction:', error);
        return null;
    }
};

/**
 * Send an Ethereum RPC request
 * @param rpcUrl - The RPC URL
 * @param method - The RPC method
 * @param params - The RPC parameters
 * @returns The RPC response
 */
export const sendEthereumRpcRequest = async (rpcUrl: string, method: string, params: any[] = []) => {
    const data = {
        jsonrpc: '2.0',
        method,
        params,
        id: Date.now(),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    try {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData.error) {
            throw new Error(`RPC error: ${responseData.error.message}`);
        }

        return responseData.result;
    } catch (error: unknown) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout after 10 seconds');
        }
        throw error;
    }
};

/**
 * Get the transaction receipt from an Ethereum RPC
 * @param rpcUrl - The RPC URL
 * @param hash - The transaction hash
 * @returns The transaction receipt or null if not found
 */
const getTransactionReceiptFromRpc = async (rpcUrl: string, hash: string): Promise<any | null> => {
    try {
        const receipt = await sendEthereumRpcRequest(rpcUrl, 'eth_getTransactionReceipt', [hash]);
        return receipt;
    } catch (error) {
        console.error('Failed to get transaction receipt from RPC:', error);
        return null;
    }
};

/**
 * Get the onchain hash from a Safe hash
 * @param chain - The chain
 * @param hash - The Safe hash
 * @returns The onchain hash or null if not found
 */
export const getOnchainHashFromSafeHash = async (chain: ChainDto, hash: string): Promise<string | null> => {
    try {
        // First try to get transaction info through Safe Transaction Service
        const chainId = parseInt(chain.chainId);
        const safePayload = await getSafeTxPayload(chainId, hash);

        if (safePayload?.transactionHash) {
            return safePayload.transactionHash;
        }

        // If Safe Transaction Service doesn't return transaction hash, try querying via RPC
        if (chain.rpc && chain.rpc.length > 0) {
            // Iterate through all available RPC endpoints
            for (const rpcUrl of chain.rpc) {
                try {
                    const receipt = await getTransactionReceiptFromRpc(rpcUrl, hash);
                    if (receipt && receipt.transactionHash) {
                        return receipt.transactionHash;
                    }
                } catch (error) {
                    console.error(`Failed to query RPC ${rpcUrl}:`, error);
                    continue; // Try next RPC
                }
            }
        }

        // If all methods fail, return null
        return null;
    } catch (error) {
        console.error('Error in getOnchainHashFromSafeHash:', error);
        return null;
    }
};
