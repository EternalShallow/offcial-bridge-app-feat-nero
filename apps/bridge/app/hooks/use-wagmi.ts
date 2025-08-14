'use client';

import { useMemo, useRef } from 'react';

import { getDefaultConfig, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { binanceWallet, okxWallet, safeWallet } from '@rainbow-me/rainbowkit/wallets';
import { Chain } from 'viem';
import { fallback, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

import { isDev } from '@/common/consts/env';
import { EniChain, EniChainTestnet } from '@/common/consts/network/eni-chain';
import { NeroChain, NeroChainTestnet } from '@/common/consts/network/nero-chain';
import { useClientState } from '@/service/hooks/use-state-client';

import { getChainByDto } from './use-chains';

// Global config cache to prevent multiple initializations
let configCache: any = null;
let isInitializing = false;

const projectId = 'd6557f623234b3df721feda833385b9d';
const defaultChains: Chain[] = isDev
    ? [mainnet, sepolia, EniChainTestnet, NeroChainTestnet]
    : [mainnet, NeroChain, EniChain];

export function useWagmiConfig() {
    const state = useClientState();
    const { chains } = useClientState();
    const isInitialized = useRef(false);

    return useMemo(() => {
        // Only initialize on client side
        if (typeof window === 'undefined') {
            return null;
        }

        // Return cached config if already initialized
        if (configCache && isInitialized.current) {
            return configCache;
        }

        // Prevent multiple simultaneous initializations
        if (isInitializing) {
            return null;
        }

        isInitializing = true;

        try {
            const chainsWithIcons = chains.length
                ? (chains.map((chain) => getChainByDto(chain)).filter(Boolean) as Chain[])
                : defaultChains;

            const transports = chainsWithIcons.reduce(
                (accum, chain) => ({
                    ...accum,
                    [chain.id]: fallback(chain.rpcUrls.default.http.map((url) => http(url))),
                }),
                {}
            );

            // Get default wallets from RainbowKit
            const { wallets } = getDefaultWallets({
                appName: state.name,
                projectId,
            });

            // Create wallet groups
            const walletGroups = [...wallets];

            // Add additional wallets if needed
            if (typeof window !== 'undefined' && window.ethereum?.isBinance) {
                walletGroups[0].wallets.unshift(binanceWallet);
            }

            // Add OKX wallet
            walletGroups[0].wallets.push(okxWallet);

            // Add Safe wallet group
            walletGroups.push({ groupName: 'More', wallets: [safeWallet] });

            const config = getDefaultConfig({
                appName: state.name,
                projectId,
                appDescription: state.metadata?.description,
                appIcon: state.metadata?.favicon || '/favicon.ico',
                chains: chainsWithIcons as any,
                transports: transports,
                ssr: false,
                multiInjectedProviderDiscovery: true,
                wallets: walletGroups,
            });

            // Cache the config
            configCache = config;
            isInitialized.current = true;

            return config;
        } finally {
            isInitializing = false;
        }
    }, [state.name, state.metadata?.description, state.metadata?.favicon, chains]);
}
