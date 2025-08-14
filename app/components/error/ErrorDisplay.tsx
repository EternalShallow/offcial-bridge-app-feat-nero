'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

interface ErrorDisplayProps {
    error: Error;
    errorCode?: number;
    title?: string;
    message?: string;
    showDetails?: boolean;
    onReset?: () => void;
    showHomeButton?: boolean;
    variant?: 'light' | 'dark';
}

export default function ErrorDisplay({
    error,
    errorCode = 500,
    title = 'Something went wrong',
    message = 'An unexpected error occurred. Please try refreshing the page.',
    showDetails = false,
    onReset,
    showHomeButton = true,
}: ErrorDisplayProps) {
    // Use state to avoid hydration mismatch
    const [isClient, setIsClient] = useState(false);
    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Check if we're in development environment
        const dev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        setIsDev(dev);
    }, []);

    const shouldShowDetails = showDetails || (isClient && isDev);

    const containerClasses = 'bg-background text-t1';
    const cardClasses = 'bg-bg1 border-red-500/20';
    const textClasses = 'text-t1';
    const detailsClasses = 'bg-bg1 text-t1';

    return (
        <div className={`w-full h-screen flex items-center justify-center ${containerClasses}`}>
            <div className={`text-center max-w-md mx-auto p-8 rounded-2xl shadow-2xl border ${cardClasses}`}>
                <svg
                    className="w-24 h-24 mx-auto mb-6 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                </svg>
                <h1 className="text-6xl font-bold mb-4">{errorCode}</h1>
                <h2 className={`text-xl font-semibold mb-4 ${textClasses}`}>{title}</h2>
                <p className={`mb-6 ${textClasses}`}>{message}</p>

                {shouldShowDetails && (
                    <details className="mb-6 text-left">
                        <summary className="text-red-400 cursor-pointer mb-2">Error Details</summary>
                        <pre className={`text-xs p-3 rounded overflow-auto max-h-32 ${detailsClasses}`}>
                            {error.message}
                            {error.stack && `\n\n${error.stack}`}
                        </pre>
                    </details>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {onReset && (
                        <button
                            onClick={onReset}
                            className="px-6 py-3 bg-primary-gradient text-foreground rounded-lg hover:opacity-90 transition-colors text-center"
                        >
                            Try Again
                        </button>
                    )}
                    {showHomeButton && (
                        <Link
                            href="/"
                            className="px-6 py-3 bg-gray-200 text-foreground rounded-lg hover:bg-gray-200/80 transition-colors text-center"
                        >
                            Return Home
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
