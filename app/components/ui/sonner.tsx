'use client';

import { useTheme } from 'next-themes';

import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className="toaster group"
            toastOptions={{
                classNames: {
                    error: '!bg-error !text-error-foreground !border !border-error',
                    success: '!bg-success !text-success-foreground !border !border-success',
                    warning: '!bg-warning !text-warning-foreground !border !border-warning',
                    info: '!bg-info !text-info-foreground !border !border-info',
                },
            }}
            // style={
            //     {
            //         '--normal-bg': 'var(--popover)',
            //         '--normal-text': 'var(--popover-foreground)',
            //         '--normal-border': 'var(--border)',
            //     } as React.CSSProperties
            // }
            {...props}
        />
    );
};

export { Toaster };
