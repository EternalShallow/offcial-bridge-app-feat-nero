'use client';

import React from 'react';

import ErrorDisplay from './components/error/ErrorDisplay';
import { log } from './utils/log';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorComponent({ error, reset }: ErrorProps) {
    // Log error for debugging
    React.useEffect(() => {
        log('Global Error', {
            message: error.message,
            stack: error.stack,
            digest: error.digest,
        });
    }, [error]);

    return (
        <ErrorDisplay
            error={error}
            title="Internal Server Error"
            message="Something went wrong on our end. Please try again later."
            onReset={reset}
        />
    );
}
