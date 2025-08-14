import type { NextConfig } from 'next';

import path from 'path';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    outputFileTracingRoot: path.join(__dirname, '../..'),
    serverExternalPackages: ['@rainbow-me/rainbowkit', '@wagmi/core', 'wagmi'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.orbiter.finance',
                pathname: '/icon/**',
            },
        ],
    },
};

export default nextConfig;
