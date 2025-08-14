/**
 * Simplified Error Handler
 * Provides unified error classification, prompts and logging functionality
 */
import { toast } from 'sonner';

import {
    ErrorCode,
    ErrorInfo,
    ErrorSeverity,
    getErrorCodeFromHttpStatus,
    getErrorInfo,
    mapBusinessErrorCode,
} from './error-codes';

// Error handling configuration
interface ErrorConfig {
    showToast?: boolean;
    logError?: boolean;
    locale?: 'en' | 'zh';
}

// Default configuration
const defaultConfig: ErrorConfig = {
    showToast: true,
    logError: true,
    locale: 'en',
};

/**
 * Error Handler Class
 */
export class ErrorHandler {
    private config: ErrorConfig;

    constructor(config: ErrorConfig = {}) {
        this.config = { ...defaultConfig, ...config };
    }

    /**
     * Main method to handle errors
     */
    handleError(error: unknown, customCode?: ErrorCode, customMessage?: string): ErrorInfo {
        // Get error information
        const errorInfo = customCode ? this.getCustomErrorInfo(customCode, customMessage) : this.analyzeError(error);

        // Show error prompt
        if (this.config.showToast) {
            this.showToast(errorInfo);
        }

        // Log error
        if (this.config.logError) {
            this.logError(errorInfo, error);
        }

        return errorInfo;
    }

    /**
     * Get custom error information
     */
    private getCustomErrorInfo(code: ErrorCode, message?: string): ErrorInfo {
        const errorInfo = getErrorInfo(code, this.config.locale);
        if (message) {
            errorInfo.message = message;
        }
        return errorInfo;
    }

    /**
     * Analyze error type
     */
    private analyzeError(error: unknown): ErrorInfo {
        if (error instanceof Error) {
            return this.analyzeErrorObject(error);
        } else if (typeof error === 'string') {
            return this.analyzeErrorString(error);
        } else if (error && typeof error === 'object' && 'response' in error) {
            return this.analyzeHttpError(error as any);
        }
        return getErrorInfo(ErrorCode.UNKNOWN_ERROR, this.config.locale);
    }

    /**
     * Analyze Error object
     */
    private analyzeErrorObject(error: Error): ErrorInfo {
        const message = error.message.toLowerCase();
        const errorCode = (error as any).code;

        // Wallet rejection errors
        if (this.isWalletRejection(message, errorCode)) {
            return getErrorInfo(ErrorCode.WALLET_REJECTED, this.config.locale);
        }

        // Network related errors
        if (message.includes('network') || message.includes('fetch')) {
            return getErrorInfo(ErrorCode.NETWORK_ERROR, this.config.locale);
        }

        // Timeout errors
        if (message.includes('timeout')) {
            return getErrorInfo(ErrorCode.REQUEST_TIMEOUT, this.config.locale);
        }

        // Insufficient balance
        if (message.includes('insufficient funds')) {
            return getErrorInfo(ErrorCode.INSUFFICIENT_BALANCE, this.config.locale);
        }

        // Gas related errors
        if (message.includes('insufficient gas')) {
            return getErrorInfo(ErrorCode.INSUFFICIENT_GAS, this.config.locale);
        }

        if (message.includes('gas limit exceeded')) {
            return getErrorInfo(ErrorCode.GAS_LIMIT_EXCEEDED, this.config.locale);
        }

        if (message.includes('gas price too low')) {
            return getErrorInfo(ErrorCode.GAS_PRICE_TOO_LOW, this.config.locale);
        }

        // Nonce errors
        if (message.includes('nonce too low')) {
            return getErrorInfo(ErrorCode.NONCE_TOO_LOW, this.config.locale);
        }

        if (message.includes('nonce too high')) {
            return getErrorInfo(ErrorCode.NONCE_TOO_HIGH, this.config.locale);
        }

        // Transaction execution errors
        if (message.includes('execution reverted') || message.includes('execution revert')) {
            return getErrorInfo(ErrorCode.EXECUTION_REVERTED, this.config.locale);
        }

        // Bridge related errors
        if (message.includes('bridge paused')) {
            return getErrorInfo(ErrorCode.BRIDGE_PAUSED, this.config.locale);
        }

        if (message.includes('bridge disabled')) {
            return getErrorInfo(ErrorCode.BRIDGE_DISABLED, this.config.locale);
        }

        if (message.includes('amount too small')) {
            return getErrorInfo(ErrorCode.AMOUNT_TOO_SMALL, this.config.locale);
        }

        if (message.includes('amount too large')) {
            return getErrorInfo(ErrorCode.AMOUNT_TOO_LARGE, this.config.locale);
        }

        if (message.includes('insufficient liquidity')) {
            return getErrorInfo(ErrorCode.INSUFFICIENT_LIQUIDITY, this.config.locale);
        }

        if (message.includes('no route found')) {
            return getErrorInfo(ErrorCode.NO_ROUTE_FOUND, this.config.locale);
        }

        if (message.includes('route expired')) {
            return getErrorInfo(ErrorCode.ROUTE_EXPIRED, this.config.locale);
        }

        // RPC errors
        if (message.includes('rpc error') || message.includes('rpc timeout')) {
            return getErrorInfo(ErrorCode.RPC_ERROR, this.config.locale);
        }

        return getErrorInfo(ErrorCode.UNKNOWN_ERROR, this.config.locale);
    }

    /**
     * Check if it's a wallet rejection error
     */
    private isWalletRejection(message: string, errorCode?: string | number): boolean {
        const rejectionKeywords = [
            'rejected the request',
            'denied transaction signature',
            'user rejected',
            'user denied',
            'user cancelled',
            'user canceled',
            'user declined',
            'transaction rejected',
            'transaction denied',
            'transaction cancelled',
            'transaction canceled',
        ];

        const rejectionCodes = [4001, 'ACTION_REJECTED', 'USER_REJECTED'];

        return (
            rejectionKeywords.some((keyword) => message.includes(keyword)) || rejectionCodes.includes(errorCode as any)
        );
    }

    /**
     * Analyze string error
     */
    private analyzeErrorString(error: string): ErrorInfo {
        return this.analyzeErrorObject(new Error(error));
    }

    /**
     * Analyze HTTP error
     */
    private analyzeHttpError(error: any): ErrorInfo {
        const response = error.response;
        if (!response) {
            return getErrorInfo(ErrorCode.NETWORK_ERROR, this.config.locale);
        }

        const { status, data } = response;

        // Check for business error code in response data
        if (data && typeof data.code === 'number' && data.code !== 0) {
            // Map business error code to existing error code
            const mappedErrorCode = mapBusinessErrorCode(data.code);
            return getErrorInfo(mappedErrorCode, this.config.locale);
        }

        // Handle HTTP status codes
        const errorCode = getErrorCodeFromHttpStatus(status);
        return getErrorInfo(errorCode, this.config.locale);
    }

    /**
     * Show error toast
     */
    private showToast(errorInfo: ErrorInfo): void {
        if (typeof window === 'undefined') {
            return; // Skip toast on server side
        }

        const { severity, message } = errorInfo;

        try {
            switch (severity) {
                case ErrorSeverity.CRITICAL:
                    toast.error(message, {
                        duration: 8000,
                        description: 'Critical error, please try again later or contact support',
                    });
                    break;
                case ErrorSeverity.HIGH:
                    toast.error(message, {
                        duration: 6000,
                        description: 'Important error, please check and try again',
                    });
                    break;
                case ErrorSeverity.MEDIUM:
                    toast.error(message, { duration: 4000 });
                    break;
                case ErrorSeverity.LOW:
                    toast.error(message, { duration: 3000 });
                    break;
                default:
                    toast.error(message);
            }
        } catch (error) {
            // Fallback to console if toast fails
            console.error('Toast error:', error);
        }
    }

    /**
     * Log error
     */
    private logError(errorInfo: ErrorInfo, originalError: unknown): void {
        const logData = {
            ...errorInfo,
            originalError:
                originalError instanceof Error
                    ? { name: originalError.name, message: originalError.message, stack: originalError.stack }
                    : originalError,
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        };

        console.error('【ErrorHandler】', logData);
    }

    /**
     * Handle error silently (no user prompt)
     */
    handleErrorSilently(error: unknown, customCode?: ErrorCode): ErrorInfo {
        const originalShowToast = this.config.showToast;
        this.config.showToast = false;

        const result = this.handleError(error, customCode);

        this.config.showToast = originalShowToast;
        return result;
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<ErrorConfig>): void {
        this.config = { ...this.config, ...config };
    }
}

// Create default error handler instance
export const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error: unknown, customCode?: ErrorCode, customMessage?: string) =>
    errorHandler.handleError(error, customCode, customMessage);

export const handleErrorSilently = (error: unknown, customCode?: ErrorCode) =>
    errorHandler.handleErrorSilently(error, customCode);

/**
 * Handle API business error specifically
 * @param response - API response data
 * @param customMessage - Optional custom error message
 */
export const handleApiBusinessError = (response: { code: number; message?: string }, customMessage?: string) => {
    if (response.code !== 0) {
        const error = new Error(response.message || customMessage || 'Business error occurred');
        (error as any).response = {
            data: response,
            status: 200,
        };
        // Map business error code to existing error code
        const mappedErrorCode = mapBusinessErrorCode(response.code);
        handleError(error, mappedErrorCode, response.message);
        return true; // Indicates error was handled
    }
    return false; // No error
};

/**
 * Check if API response indicates business error
 * @param response - API response data
 * @returns true if business error, false otherwise
 */
export const isApiBusinessError = (response: { code: number }): boolean => {
    return response.code !== 0;
};
