'use client';

import { ReactNode, useEffect, useState } from 'react';

import { useTheme as useNextTheme } from 'next-themes';

import { Locale, RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useTranslation } from 'react-i18next';
import { WagmiProvider } from 'wagmi';

import { useWagmiConfig } from '@/hooks/use-wagmi';
import { useClientState } from '@/service/hooks/use-state-client';
import { useFromChainId } from '@/service/stores/bridge.store';

export function Web3Client({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);

    // Ensure consistent hook call order
    const { resolvedTheme } = useNextTheme();
    const wagmiConfig = useWagmiConfig();
    const { metadata, name, theme } = useClientState();
    const fromChainId = useFromChainId();

    // Use useTranslation after mounted
    const { i18n } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render anything until mounted and config is available
    if (!mounted || !wagmiConfig) {
        return <>{children}</>;
    }

    const rainbowTheme =
        resolvedTheme === 'light'
            ? lightTheme({
                  borderRadius: 'large',
                  accentColor: 'var(--primary-gradient)',
                  accentColorForeground: theme?.foregroundDark,
              })
            : darkTheme({
                  borderRadius: 'large',
                  accentColor: 'var(--primary-gradient)',
                  accentColorForeground: theme?.foregroundDark,
              });

    // Ensure i18n is initialized
    const locale: Locale =
        i18n?.isInitialized && i18n.language?.includes('zh') ? 'zh' : (i18n?.resolvedLanguage as Locale) || 'en';

    return (
        <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider
                initialChain={fromChainId}
                locale={locale}
                theme={rainbowTheme}
                appInfo={{
                    appName: name,
                    learnMoreUrl: metadata?.learnMoreUrl,
                }}
                coolMode
                showRecentTransactions={false}
            >
                {children}
            </RainbowKitProvider>
        </WagmiProvider>
    );
}
