'use client';

import React, { useEffect } from 'react';

import { LogCategory, logger } from '@/utils/logger';

import ErrorDisplay from './ErrorDisplay';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        logger.error(LogCategory.ERROR, 'ErrorBoundary caught error', error, {
            componentStack: errorInfo.componentStack,
        });
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
            }

            return (
                <ErrorDisplay
                    error={this.state.error}
                    title="Something went wrong"
                    message="An unexpected error occurred. Please try refreshing the page."
                    onReset={this.resetError}
                />
            );
        }

        return (
            <>
                <GlobalErrorHandler />
                {this.props.children}
            </>
        );
    }
}

// Global error handler component
function GlobalErrorHandler() {
    useEffect(() => {
        // Global error handler for unhandled errors
        const handleGlobalError = (event: ErrorEvent) => {
            logger.error(LogCategory.ERROR, 'Global Error', new Error(event.message), {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
            });
        };

        // Unhandled promise rejection handler
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            logger.error(LogCategory.ERROR, 'Unhandled Promise Rejection', new Error(String(event.reason)), {
                reason: event.reason,
                promise: event.promise,
            });
        };

        // Track resource loading errors - only log actual errors
        const handleResourceError = (event: ErrorEvent) => {
            // Only log if it's a real error, not a successful response
            if (event.error && !event.message.includes('checkCrossOriginOpenerPolicy')) {
                logger.error(LogCategory.ERROR, 'Resource loading error', new Error(event.message), {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                });
            }
        };

        // Track fetch errors - only log actual errors, not successful responses
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                return response;
            } catch (error) {
                const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
                logger.warn(
                    LogCategory.ERROR,
                    'Fetch error',
                    error instanceof Error ? error : new Error(String(error)),
                    { url }
                );
                throw error;
            }
        };

        // Track XMLHttpRequest errors
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (
            method: string,
            url: string | URL,
            async?: boolean,
            username?: string | null,
            password?: string | null
        ) {
            (this as any)._trackedUrl = url.toString();
            return originalXHROpen.call(this, method, url, async ?? true, username, password);
        };

        XMLHttpRequest.prototype.send = function (...args) {
            this.addEventListener('load', function () {
                if (this.status === 500) {
                    logger.error(LogCategory.ERROR, 'XHR 500 error', new Error(`HTTP ${this.status}`), {
                        url: (this as any)._trackedUrl,
                        status: this.status,
                        statusText: this.statusText,
                    });
                }
            });

            return originalXHRSend.call(this, ...args);
        };

        // Add event listeners
        window.addEventListener('error', handleGlobalError);
        window.addEventListener('error', handleResourceError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // Cleanup
        return () => {
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('error', handleResourceError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.fetch = originalFetch;
            XMLHttpRequest.prototype.open = originalXHROpen;
            XMLHttpRequest.prototype.send = originalXHRSend;
        };
    }, []);

    return null; // This component doesn't render anything
}

export default ErrorBoundary;
