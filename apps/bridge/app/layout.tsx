import React from 'react';
import { cache } from 'react';

import { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';

import { metadataConfig } from './common/consts/config/metadata';
import { DEFAULT_HOST, isDev, isTestnet } from './common/consts/env';
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
    const host = isDev || isTestnet ? DEFAULT_HOST || '' : h.get('host') || '';
    logger.info(LogCategory.BRIDGE, 'Getting bridge config', { host, DEFAULT_HOST });

    const config = await getBridgeConfig({
        host,
    }).catch((error) => {
        logger.error(LogCategory.API, 'Bridge config error', error, { host });
        return null;
    });

    if (!config?.data) {
        throw new Error('Server: Global Config Error');
    }
    return { host, ...config.data };
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
