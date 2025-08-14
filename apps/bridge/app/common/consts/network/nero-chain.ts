import { Chain } from 'viem';

import { ChainDto } from '@/service/models/chain.model';

export const NeroChain: Chain = {
    id: 1689,
    name: 'NERO Chain Mainnet',
    rpcUrls: {
        default: {
            http: ['https://rpc.nerochain.io'],
        },
    },
    nativeCurrency: {
        name: 'NERO Token',
        symbol: 'NERO',
        decimals: 18,
    },
    blockExplorers: {
        default: {
            name: 'Explorer',
            url: 'https://neroscan.io',
        },
    },
};

export const NeroChainTestnet: Chain = {
    id: 689,
    name: 'NERO Chain Testnet',
    rpcUrls: {
        default: {
            http: ['https://rpc-testnet.nerochain.io'],
        },
    },
    nativeCurrency: {
        name: 'NERO Token',
        symbol: 'NERO',
        decimals: 18,
    },
    blockExplorers: {
        default: {
            name: 'Explorer',
            url: 'https://testnet.neroscan.io',
        },
    },
};

export const NeroChainDto: ChainDto = {
    chainId: '1689',
    name: 'NERO Chain Mainnet',
    rpc: ['https://rpc.nerochain.io'],
    nativeCurrency: {
        name: 'NERO Token',
        chainId: '1689',
        symbol: 'NERO',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000',
        coinKey: 'NERO',
    },
    explorers: [
        {
            url: 'https://neroscan.io',
            name: 'NERO Explorer',
        }
    ],
    vm: 'EVM',
    links: {
        wrapUrl: '',
        unwrapUrl: '',
    },
};

export const NeroChainTestnetDto: ChainDto = {
    chainId: '689',
    name: 'NERO Testnet',
    rpc: ['https://rpc-testnet.nerochain.io'],
    nativeCurrency: {
        name: 'NERO Token',
        chainId: '6912115',
        symbol: 'NERO',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000',
        coinKey: 'NERO',
    },
    explorers: [
        {
            url: 'https://testnet.neroscan.io',
            name: 'ENI Explorer',
        },
    ],
    vm: 'EVM',
    links: {
        wrapUrl: '',
        unwrapUrl: '',
    },
};
