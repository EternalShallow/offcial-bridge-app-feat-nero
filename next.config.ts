import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
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
