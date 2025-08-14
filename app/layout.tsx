import React from 'react';
import { cache } from 'react';

import { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';

import { metadataConfig } from './common/consts/config/metadata';
import { DEFAULT_HOST, isDev, isTestnet, getBridgeHost } from './common/consts/env';
import { defaultAppConfig } from './common/consts/global';
import { Providers } from './common/providers';
import { InjectedWrapper } from './common/providers/injected-wrapper';
import { ErrorBoundary, ErrorDisplay } from './components/error';
import './globals.css';
import { getBridgeConfig } from './service/apis/bridge.api';
import { getMetadata, getViewport } from './utils/get-metadata';
import { LogCategory, logger } from './utils/logger';

// Google font for the body
// const inter = Inter({ subsets: ['latin'] });

const getInjectState = cache(async () => {
    const h = await headers();
    
    // Use the new getBridgeHost function to determine the correct host
    const host = getBridgeHost();
    
    logger.info(LogCategory.BRIDGE, 'Getting bridge config', { 
        host, 
        bridgeEnv: process.env.NEXT_PUBLIC_BRIDGE_ENV,
        isTestnet,
        isMainnet: process.env.NEXT_PUBLIC_BRIDGE_ENV === 'mainnet'
    });

    try {
        // Try to get config from API first
        const config = await getBridgeConfig({ host });
        
        if (config?.data) {
            logger.info(LogCategory.BRIDGE, 'Using API config', { host });
            return { host, ...config.data };
        }
    } catch (error) {
        logger.warn(LogCategory.BRIDGE, 'API config failed, using local config', { 
            host, 
            error: error instanceof Error ? error.message : String(error) 
        });
    }
    
    // Fallback to local config if API fails
    logger.info(LogCategory.BRIDGE, 'Using local default config', { 
        host, 
        configType: isTestnet ? 'testnet' : 'mainnet' 
    });
    
    return { host, ...defaultAppConfig };
});

export async function generateMetadata(): Promise<Metadata> {
    try {
        const injectedState = await getInjectState();
        const metadata = injectedState.metadata || defaultAppConfig.metadata;

        return getMetadata(metadata);
    } catch (error) {
        logger.error(
            LogCategory.GENERAL,
            'Server: Metadata generation error',
            error instanceof Error ? error : new Error(String(error))
        );
        
        // Fallback to default metadata
        logger.info(LogCategory.GENERAL, 'Using fallback metadata config');
        return getMetadata(metadataConfig);
    }
}

export const viewport: Viewport = getViewport();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    try {
        const injectedState = await getInjectState();
        return (
            <html lang="en" suppressHydrationWarning>
                <body>
                    <ErrorBoundary>
                        <InjectedWrapper initialValues={injectedState}>
                            <Providers>{children}</Providers>
                        </InjectedWrapper>
                    </ErrorBoundary>
                </body>
            </html>
        );
    } catch (error) {
        return (
            <html lang="en" suppressHydrationWarning>
                <body>
                    <ErrorDisplay
                        error={error as Error}
                        title="Critical error"
                        message="An unexpected error occurred. Please try refreshing the page."
                        showHomeButton={false}
                    />
                </body>
            </html>
        );
    }
}
