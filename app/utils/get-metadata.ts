import { Viewport } from 'next';

import { MetadataDto } from '@/service/models/bridge.model';

export const getMetadata = (metadata: MetadataDto) => {
    return {
        title: metadata.title,
        description: metadata.description,
        openGraph: {
            title: metadata.title,
            description: metadata.description,
            url: metadata.url,
            images: [
                {
                    url: metadata.og,
                    width: 1200,
                    height: 630,
                    alt: metadata.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: metadata.title,
            description: metadata.description,
            images: [metadata.og],
            creator: metadata.twitter,
            site: metadata.twitter,
        },
        icons: {
            icon: metadata.favicon,
            shortcut: metadata.favicon,
            apple: metadata.favicon,
        },
    };
};

export const getViewport = (): Viewport => {
    return {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    };
};
