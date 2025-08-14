/* eslint-disable turbo/no-undeclared-env-vars */
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export const isMainnet = process.env.NEXT_PUBLIC_BRIDGE_ENV === 'mainnet';
export const isTestnet = process.env.NEXT_PUBLIC_BRIDGE_ENV === 'testnet';

export const DEFAULT_HOST = process.env.NEXT_PUBLIC_DEFAULT_HOST;

// Project ID for API authentication
export const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID;

/**
 * Get the correct host based on bridge environment
 * This ensures we use the right host for each environment
 */
export const getBridgeHost = (): string => {
    if (isTestnet) {
        return 'test.d2ps0ulbl914sr.amplifyapp.com';
    } else if (isMainnet) {
        return 'nero.d2ps0ulbl914sr.amplifyapp.com';
    } else {
        // Fallback to environment variable or default
        return DEFAULT_HOST || 'test.d2ps0ulbl914sr.amplifyapp.com';
    }
};
