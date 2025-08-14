import { Chain } from 'viem';

import { ChainDto } from '@/service/models/chain.model';

export const EniChain: Chain = {
    id: 6912115,
    name: 'ENI',
    rpcUrls: {
        default: {
            http: ['https://rpc-testnet.eniac.network', 'https://scan-testnet.eniac.network'],
        },
    },
    nativeCurrency: {
        name: 'ENI Token',
        symbol: 'ENI',
        decimals: 18,
    },
    blockExplorers: {
        default: {
            name: 'ENI Explorer',
            url: 'https://scan-testnet.eniac.network',
        },
    },
};

export const EniChainTestnet: Chain = {
    id: 6912115,
    name: 'ENI Testnet',
    rpcUrls: {
        default: {
            http: ['https://rpc-testnet.eniac.network', 'https://scan-testnet.eniac.network'],
        },
    },
    nativeCurrency: {
        name: 'ENI Token',
        symbol: 'ENI',
        decimals: 18,
    },
    blockExplorers: {
        default: {
            name: 'ENI Explorer',
            url: 'https://scan-testnet.eniac.network',
        },
    },
};

export const EniChainDto: ChainDto = {
    chainId: '6912115',
    name: 'ENI',
    rpc: ['https://rpc-testnet.eniac.network', 'https://scan-testnet.eniac.network'],
    nativeCurrency: {
        name: 'ENI Token',
        chainId: '6912115',
        symbol: 'ENI',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000',
        coinKey: 'ENI',
        // "iconUrl": "https://eniac.network/logo.png"
    },
    explorers: [
        {
            url: 'https://scan-testnet.eniac.network',
            name: 'ENI Explorer',
        },
        {
            url: 'https://faucet-testnet.eniac.network',
            name: 'ENI Faucet',
        },
    ],
    vm: 'EVM',
    links: {
        wrapUrl: ' https://eni-mu.vercel.app/bridge',
        unwrapUrl: ' https://eni-mu.vercel.app/bridge',
    },
};

export const EniChainTestnetDto: ChainDto = {
    chainId: '6912115',
    name: 'ENI Testnet',
    rpc: ['https://rpc-testnet.eniac.network', 'https://scan-testnet.eniac.network'],
    nativeCurrency: {
        name: 'ENI Token',
        chainId: '6912115',
        symbol: 'ENI',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000',
        coinKey: 'ENI',
        // "iconUrl": "https://eniac.network/logo.png"
    },
    explorers: [
        {
            url: 'https://scan-testnet.eniac.network',
            name: 'ENI Explorer',
        },
        {
            url: 'https://faucet-testnet.eniac.network',
            name: 'ENI Faucet',
        },
    ],
    vm: 'EVM',
    links: {
        wrapUrl: ' https://eni-mu.vercel.app/bridge',
        unwrapUrl: ' https://eni-mu.vercel.app/bridge',
    },
};
