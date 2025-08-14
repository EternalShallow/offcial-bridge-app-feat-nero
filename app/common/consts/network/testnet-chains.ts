import { ChainDto } from '@/service/models/chain.model';

import { EniChainTestnetDto } from './eni-chain';
import { NeroChainTestnetDto } from './nero-chain';

export const testnetChains: ChainDto[] = [
    EniChainTestnetDto,
    NeroChainTestnetDto,
    {
        chainId: '11155111',
        name: 'Sepolia',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
            address: '0x0000000000000000000000000000000000000000',
        },
        rpc: [
            'https://eth-sepolia.g.alchemy.com/v2/mf7LavWgl6idryZtb9IJadAr0jf8KETr',
            'https://ethereum-sepolia-rpc.publicnode.com',
            'https://ethereum-sepolia.publicnode.com',
            'https://rpc.notadegen.com/eth/sepolia',
            'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
            'https://rpc.notadegen.com/sepolia',
            'https://sepolia.gateway.tenderly.co',
            'https://api.zan.top/node/v1/eth/sepolia/public',
            'https://rpc.sepolia.org',
        ],
        explorers: [
            { name: 'etherscan-sepolia', url: 'https://sepolia.etherscan.io' },
            { name: 'otterscan-sepolia', url: 'https://sepolia.otterscan.io' },
        ],
        vm: 'EVM',
    },
    {
        chainId: '97',
        name: 'BSC TestNet',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
            address: '0x0000000000000000000000000000000000000000',
        },
        rpc: [
            'https://bsc-testnet.publicnode.com',
            'https://api.zan.top/node/v1/bsc/testnet/public',
            'https://endpoints.omniatech.io/v1/bsc/testnet/public',
            'https://data-seed-prebsc-2-s2.bnbchain.org:8545',
        ],
        explorers: [{ name: 'bscscan-testnet', url: 'https://testnet.bscscan.com' }],
        vm: 'EVM',
    },
    {
        chainId: '5611',
        name: 'OpBSC TestNet',
        nativeCurrency: {
            name: 'tBNB',
            symbol: 'BNB',
            decimals: 18,
            address: '0x0000000000000000000000000000000000000000',
        },
        rpc: ['https://opbnb-testnet-rpc.bnbchain.org'],
        explorers: [
            { name: 'bscscan-opbnb-testnet', url: 'https://opbnb-testnet.bscscan.com' },
            { name: 'opbnbscan', url: 'https://opbnbscan.com' },
        ],
        vm: 'EVM',
    },
    {
        chainId: '421614',
        name: 'Arbitrum Sepolia',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
            address: '0x0000000000000000000000000000000000000000',
        },
        rpc: [
            'https://endpoints.omniatech.io/v1/arbitrum/sepolia/public',
            'https://sepolia-rollup.arbitrum.io/rpc',
            'https://sepolia-rollup-sequencer.arbitrum.io/rpc',
        ],
        explorers: [{ name: 'Arbitrum Sepolia Rollup Testnet Explorer', url: 'https://sepolia-explorer.arbitrum.io' }],
        vm: 'EVM',
    },
    {
        chainId: '11155420',
        name: 'Optimism Sepolia',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
            address: '0x0000000000000000000000000000000000000000',
        },
        rpc: [
            'https://public.stackup.sh/api/v1/node/optimism-sepolia',
            'https://sepolia.optimism.io',
            'https://optimism-sepolia.blockpi.network/v1/rpc/public',
        ],
        explorers: [{ name: 'opscout', url: 'https://optimism-sepolia.blockscout.com' }],
        vm: 'EVM',
    },
];

// export const testnetChainMap = testnetChains.reduce(
//     (acc, chain) => {
//         acc[chain.chainId] = chain;
//         return acc;
//     },
//     {} as Record<string, any>
// );
