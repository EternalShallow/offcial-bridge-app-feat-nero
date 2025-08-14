/* eslint-disable turbo/no-undeclared-env-vars */
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export const isMainnet = process.env.NEXT_PUBLIC_BRIDGE_ENV === 'mainnet';
export const isTestnet = process.env.NEXT_PUBLIC_BRIDGE_ENV === 'testnet';

export const DEFAULT_HOST = process.env.NEXT_PUBLIC_DEFAULT_HOST;
