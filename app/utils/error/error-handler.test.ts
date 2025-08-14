/**
 * Error Handler Usage Examples
 *
 * This file contains practical examples of how to use the error handling system
 */
import { api } from '@/common/providers/query.provider';

import { ErrorCode, mapBusinessErrorCode } from './error-codes';
import {
    ErrorHandler,
    handleApiBusinessError,
    handleError,
    handleErrorSilently,
    isApiBusinessError,
} from './error-handler';

// Example 1: Basic error handling in async function
export async function fetchUserData(userId: string) {
    try {
        const response = await api.get(`/api/users/${userId}`);
        return response.data.data;
    } catch (error) {
        // Automatically handles HTTP errors and business errors
        handleError(error);
        throw error; // Re-throw for upper layer handling
    }
}

// Example 2: Manual business error handling
export async function createOrder(orderData: any) {
    try {
        const response = await api.post('/api/orders', orderData);

        // Manually check for business error
        if (isApiBusinessError(response.data)) {
            handleApiBusinessError(response.data, '订单创建失败');
            return null;
        }

        return response.data.data;
    } catch (error) {
        handleError(error);
        return null;
    }
}

// Example 3: Custom error code handling
export async function transferTokens(amount: string, to: string) {
    try {
        const response = await api.post('/api/transfer', { amount, to });

        if (isApiBusinessError(response.data)) {
            // Use specific error code for insufficient balance
            if (response.data.code === 4001) {
                handleError(new Error(response.data.message), ErrorCode.INSUFFICIENT_BALANCE);
            } else {
                handleApiBusinessError(response.data);
            }
            return false;
        }

        return true;
    } catch (error) {
        handleError(error);
        return false;
    }
}

// Example 4: Silent error handling for user cancellations
export async function connectWallet() {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return true;
    } catch (error) {
        // User cancellation doesn't need user prompt
        handleErrorSilently(error);
        return false;
    }
}

// Example 5: Error handling in event handlers
export function handleFormSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
        // Form validation and submission logic
        const formData = new FormData(event.target as HTMLFormElement);
        submitFormData(formData);
    } catch (error) {
        handleError(error, ErrorCode.INVALID_PARAMETER, '表单数据验证失败');
    }
}

// Example 6: Bridge-specific error handling
export async function initiateBridge(fromChain: string, toChain: string, amount: string) {
    try {
        const response = await api.post('/api/bridge/initiate', {
            fromChain,
            toChain,
            amount,
        });

        if (isApiBusinessError(response.data)) {
            // Handle specific bridge errors
            switch (response.data.code) {
                case 5000:
                    handleError(new Error(response.data.message), ErrorCode.BRIDGE_PAUSED);
                    break;
                case 5002:
                    handleError(new Error(response.data.message), ErrorCode.AMOUNT_TOO_SMALL);
                    break;
                case 5003:
                    handleError(new Error(response.data.message), ErrorCode.AMOUNT_TOO_LARGE);
                    break;
                case 5004:
                    handleError(new Error(response.data.message), ErrorCode.INSUFFICIENT_LIQUIDITY);
                    break;
                default:
                    handleApiBusinessError(response.data, '桥接操作失败');
            }
            return null;
        }

        return response.data.data;
    } catch (error) {
        handleError(error);
        return null;
    }
}

// Example 7: Transaction error handling
export async function sendTransaction(transaction: any) {
    try {
        const response = await api.post('/api/transaction/send', transaction);

        if (isApiBusinessError(response.data)) {
            // Handle transaction-specific errors
            switch (response.data.code) {
                case 4001:
                    handleError(new Error(response.data.message), ErrorCode.INSUFFICIENT_BALANCE);
                    break;
                case 4002:
                    handleError(new Error(response.data.message), ErrorCode.INSUFFICIENT_GAS);
                    break;
                case 4008:
                    handleError(new Error(response.data.message), ErrorCode.GAS_LIMIT_EXCEEDED);
                    break;
                default:
                    handleError(new Error(response.data.message), ErrorCode.TRANSACTION_FAILED);
            }
            return null;
        }

        return response.data.data;
    } catch (error) {
        handleError(error);
        return null;
    }
}

// Example 8: Network error handling with retry
export async function fetchWithRetry(url: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await api.get(url);

            if (isApiBusinessError(response.data)) {
                handleApiBusinessError(response.data);
                return null;
            }

            return response.data.data;
        } catch (error) {
            if (i === retries - 1) {
                // Last retry, show error
                handleError(error, ErrorCode.NETWORK_ERROR, '网络请求失败，请检查网络连接');
                return null;
            } else {
                // Silent retry
                handleErrorSilently(error);
                await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
            }
        }
    }
}

// Example 9: Error handling with custom configuration
export function handleErrorWithCustomConfig(error: unknown) {
    // Create custom error handler instance
    const customHandler = new ErrorHandler({
        showToast: false, // Don't show toast
        logError: true, // Still log errors
        locale: 'en', // Use English
    });

    return customHandler.handleError(error);
}

// Example 10: Error boundary usage
export function createErrorBoundary() {
    return {
        componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
            // Log error for debugging
            console.error('Error caught by boundary:', error, errorInfo);

            // Show user-friendly error message
            handleError(error, ErrorCode.UNKNOWN_ERROR, '应用发生错误，请刷新页面重试');
        },
    };
}

// Helper function for form submission (mock)
function submitFormData(formData: FormData) {
    // Mock implementation
    console.log('Submitting form data:', formData);
}

// Example 11: Test business error code mapping
export function testBusinessErrorCodeMapping() {
    const testCases = [
        { businessCode: 4001, expectedError: ErrorCode.INSUFFICIENT_BALANCE },
        { businessCode: 5000, expectedError: ErrorCode.BRIDGE_PAUSED },
        { businessCode: 8001, expectedError: ErrorCode.RPC_ERROR },
        { businessCode: 9999, expectedError: ErrorCode.UNKNOWN_ERROR }, // Unmapped code
    ];

    testCases.forEach(({ businessCode, expectedError }) => {
        const mappedCode = mapBusinessErrorCode(businessCode);
        console.log(`Business code ${businessCode} → ${mappedCode} (expected: ${expectedError})`);

        if (mappedCode !== expectedError) {
            console.warn(`❌ Mapping failed: ${businessCode} should map to ${expectedError}, but got ${mappedCode}`);
        } else {
            console.log(`✅ Mapping correct: ${businessCode} → ${mappedCode}`);
        }
    });
}
