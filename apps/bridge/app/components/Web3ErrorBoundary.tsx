'use client';

import React from 'react';

import { log } from '../utils/log';

interface Web3ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface Web3ErrorBoundaryProps {
    children: React.ReactNode;
}

class Web3ErrorBoundary extends React.Component<Web3ErrorBoundaryProps, Web3ErrorBoundaryState> {
    constructor(props: Web3ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): Web3ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        log('Web3 ErrorBoundary caught error', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });
    }

    render() {
        if (this.state.hasError && this.state.error) {
            // For Web3 errors, we'll just render children without Web3 context
            // This allows the app to continue working without Web3 features
            return <>{this.props.children}</>;
        }

        return this.props.children;
    }
}

export default Web3ErrorBoundary;
