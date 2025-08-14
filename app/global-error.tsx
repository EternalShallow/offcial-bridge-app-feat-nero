'use client';

import React from 'react';

import ErrorDisplay from './components/error/ErrorDisplay';
import { log } from './utils/log';

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    // Log error for debugging
    React.useEffect(() => {
        log('Global Server Error', {
            message: error.message,
            stack: error.stack,
            digest: error.digest,
        });
    }, [error]);

    return (
        <html>
            <body>
                <ErrorDisplay
                    error={error}
                    title="Server Error"
                    message="Something went wrong on our servers. Please try again later."
                    onReset={reset}
                />
            </body>
        </html>
    );
}
