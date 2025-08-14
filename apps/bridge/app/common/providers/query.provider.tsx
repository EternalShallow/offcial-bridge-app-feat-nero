import React, { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { mapBusinessErrorCode } from '@/utils/error/error-codes';
import { handleError } from '@/utils/error/error-handler';

export const baseURL = process.env['NEXT_PUBLIC_BASE_URL'] || 'https://bridgex-api.orbiter.finance/api/v1';

// API response interface
export interface ApiResponseData<T = any> {
    code: number;
    message?: string;
    data?: T;
}

// Retry configuration interface
interface RetryConfig {
    retries: number;
    retryDelay: number;
    retryCondition: (error: any) => boolean;
}

// Default retry configuration
const defaultRetryConfig: RetryConfig = {
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
        // Retry on network errors, timeouts, and 5xx server errors
        return (
            !error.response ||
            (error.response && error.response.status >= 500) ||
            error.code === 'ECONNABORTED' ||
            error.message.includes('timeout')
        );
    },
};

// Enhanced axios instance with retry functionality
const createAxiosInstance = (config?: AxiosRequestConfig, retryConfig?: Partial<RetryConfig>) => {
    const instance = Axios.create({
        baseURL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
        ...config,
    });

    const finalRetryConfig = { ...defaultRetryConfig, ...retryConfig };

    // Add request interceptor for retry logic
    instance.interceptors.request.use(
        async (config) => {
            // Add retry configuration to request
            (config as any).retryConfig = finalRetryConfig;
            (config as any).retryCount = 0;
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Add response interceptor with retry logic
    instance.interceptors.response.use(
        (response: AxiosResponse<ApiResponseData>) => {
            const { data } = response;

            // Check if response has business error code (code !== 0)
            if (data && typeof data.code === 'number' && data.code !== 0) {
                // Create error object for business error
                const businessError = new Error(data.message || 'Business error occurred');
                (businessError as any).response = {
                    data: {
                        code: data.code,
                        message: data.message,
                    },
                    status: 200, // HTTP status is 200, but business code indicates error
                };

                // Map business error code to existing error code and handle
                const mappedErrorCode = mapBusinessErrorCode(data.code);
                handleError(businessError, mappedErrorCode, data.message);

                return Promise.reject(businessError);
            }

            return response;
        },
        async (error) => {
            const config = error.config;
            const retryConfig = (config as any)?.retryConfig || finalRetryConfig;
            const retryCount = (config as any)?.retryCount || 0;

            // Check if we should retry
            if (retryCount < retryConfig.retries && retryConfig.retryCondition(error)) {
                // Increment retry count
                (config as any).retryCount = retryCount + 1;

                // Calculate delay with exponential backoff
                const delay = retryConfig.retryDelay * Math.pow(2, retryCount);

                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, delay));

                // Retry the request
                return instance(config);
            }

            // Use unified error handling system for HTTP errors
            handleError(error);

            return Promise.reject(error);
        }
    );

    return instance;
};

// Create default axios instance
export const api = createAxiosInstance();

// Create specialized axios instance for getBridgeConfig with specific configuration
export const bridgeConfigApi = createAxiosInstance(
    {
        timeout: 5000, // 5 seconds timeout
    },
    {
        retries: 3,
        retryDelay: 1000,
        retryCondition: (error) => {
            // Retry on network errors, timeouts, and 5xx server errors
            return (
                !error.response ||
                (error.response && error.response.status >= 500) ||
                error.code === 'ECONNABORTED' ||
                error.message.includes('timeout')
            );
        },
    }
);

export type ApiResponse<T> = Promise<AxiosResponse<T>>;

// Create a react-query client with error handling configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60, // 1 minute
        },
        mutations: {
            retry: 0,
        },
    },
});

// Provider component wrapper for React Query
export function QueryProvider({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
