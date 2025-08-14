'use client';

import { ReactNode } from 'react';

import { ThemeProvider } from 'next-themes';

import { Web3Client } from '@/components/Web3Client';
// import Web3ErrorBoundary from '@/components/Web3ErrorBoundary';
import useI18n from '@/i18n';

import { QueryProvider } from './query.provider';

function I18nInitializer({ children }: { children: ReactNode }) {
    useI18n();
    return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <I18nInitializer>
                <QueryProvider>
                    <Web3Client>{children}</Web3Client>
                </QueryProvider>
            </I18nInitializer>
        </ThemeProvider>
    );
}
