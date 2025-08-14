/**
 * Manager Module Index
 *
 * This module exports all manager-related utilities including
 * RPC management and error handling.
 */

// Export RPC Manager
export { RpcManager, rpcManager, getRpcManagerStatus, getRpcManagerStats, resetAllRpcFailures } from './rpc-manager';

// Export Error Management
export {
    BUSINESS_LOGIC_ERRORS,
    REAL_RPC_ERRORS,
    isBusinessLogicError,
    isRealRpcError,
    isRealRpcFailure,
} from './rpc-error';
