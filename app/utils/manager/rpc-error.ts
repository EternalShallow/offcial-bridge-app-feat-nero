/**
 * Error Management for RPC Manager
 *
 * This module contains static error lists used to distinguish between
 * business logic errors and real RPC infrastructure errors.
 *
 * Business logic errors should NOT mark RPC as failed
 * Real RPC errors should mark RPC as failed
 */

// Business logic errors that should NOT mark RPC as failed
export const BUSINESS_LOGIC_ERRORS = [
    'execution reverted',
    'execution revert',
    'reverted',
    'revert',
    'insufficient funds',
    'gas required exceeds allowance',
    'nonce too low',
    'nonce too high',
    'replacement transaction underpriced',
    'transaction underpriced',
    'intrinsic gas too low',
    'gas limit exceeded',
    'invalid opcode',
    'out of gas',
    'call exception',
    'invalid jump',
    'stack overflow',
    'stack underflow',
    'invalid instruction',
    'out of data',
    'invalid memory access',
    'static state change',
    'precompiled contract failed',
    'always failing transaction',
    'contract creation code storage out of gas',
    'invalid signature',
    'invalid sender',
    'invalid recipient',
    'invalid value',
    'invalid data',
    'invalid address',
    'invalid block number',
    'invalid transaction',
    'invalid block',
    'invalid uncle',
    'invalid uncle index',
    'invalid uncle data',
    'invalid uncle hash',
    'invalid uncle nonce',
    'invalid uncle difficulty',
    'invalid uncle gas limit',
    'invalid uncle gas used',
    'invalid uncle timestamp',
    'invalid uncle extra data',
    'invalid uncle mix hash',
    'invalid uncle nonce',
    'invalid uncle base fee per gas',
    'invalid uncle withdrawals root',
    'invalid uncle withdrawals',
    'invalid uncle blob gas used',
    'invalid uncle excess blob gas',
    'invalid uncle parent beacon block root',
] as const;

// Real RPC infrastructure errors that should mark RPC as failed
export const REAL_RPC_ERRORS = [
    'failed to fetch',
    'network error',
    'timeout',
    'connection refused',
    'connection reset',
    'connection timeout',
    'dns resolution failed',
    'name not resolved',
    'http error',
    'server error',
    'gateway error',
    'bad gateway',
    'service unavailable',
    'forbidden',
    'unauthorized',
    'not found',
    'internal server error',
    'bad request',
    'method not allowed',
    'request entity too large',
    'request timeout',
    'too many requests',
    'rate limit exceeded',
    'quota exceeded',
] as const;

/**
 * Check if an error message represents a business logic error
 * @param errorMessage - The error message to check
 * @returns true if it's a business logic error, false otherwise
 */
export function isBusinessLogicError(errorMessage: string): boolean {
    return BUSINESS_LOGIC_ERRORS.some((businessError) =>
        errorMessage.toLowerCase().includes(businessError.toLowerCase()),
    );
}

/**
 * Check if an error message represents a real RPC infrastructure error
 * @param errorMessage - The error message to check
 * @returns true if it's a real RPC error, false otherwise
 */
export function isRealRpcError(errorMessage: string): boolean {
    return REAL_RPC_ERRORS.some((rpcError) => errorMessage.toLowerCase().includes(rpcError.toLowerCase()));
}

/**
 * Check if an error is a real RPC failure that should mark RPC as failed
 * @param errorMessage - The error message to check
 * @returns true if it's a real RPC failure, false if it's a business logic error
 */
export function isRealRpcFailure(errorMessage: string): boolean {
    // Business logic errors should NOT mark RPC as failed
    if (isBusinessLogicError(errorMessage)) {
        return false;
    }

    // Real RPC infrastructure errors should mark RPC as failed
    return isRealRpcError(errorMessage);
}
