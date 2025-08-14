import { BridgeConfigDto } from '@/service/models/bridge.model';

import metadataConfig from './config/metadata';
import themeConfig from './config/theme';
import { mainnetTokensConfig, testnetTokensConfig } from './config/tokens';
import { isDev, isTestnet } from './env';
import { ENI_ID, ENI_TESTNET_ID } from './ids';
import { mainnetChains } from './network/mainnet-chains';
import { testnetChains } from './network/testnet-chains';
import { RouteProvider } from './route-provider';

export const DEFAULT_WRAP_URL = 'https://eni-mu.vercel.app/bridge';
export const DEFAULT_UNWRAP_URL = 'https://eni-mu.vercel.app/bridge';

const testConfig: BridgeConfigDto = {
    id: ENI_TESTNET_ID,
    name: 'Orbiter Official Bridge',
    defaultRoute: {
        id: RouteProvider.EniDeposit,
        fromChainId: 11155111,
        toChainId: 6912115,
        tokenAddress: '0xc87baaa752642beb24e3b86b624dc8a5115e321b',
    },
    chains: testnetChains,
    tokens: testnetTokensConfig,
    metadata: metadataConfig,
    thirdParty: {
        googleAnalytics: {
            gId: 'G-Y3JV98YX1B',
        },
    },
    theme: themeConfig,
};

const mainnetConfig: BridgeConfigDto = {
    id: ENI_ID,
    name: 'Orbiter Official Bridge',
    defaultRoute: {
        id: RouteProvider.EniDeposit,
        fromChainId: 1,
        toChainId: 173,
        tokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    chains: mainnetChains,
    tokens: mainnetTokensConfig, // TODO: update tokens
    metadata: metadataConfig,
    theme: themeConfig,
    thirdParty: {
        googleAnalytics: {
            gId: 'G-Y3JV98YX1B',
        },
        // sentry: {
        //     dsn: 'https://12345678901234567890123456789012@sentry.io/1234567890',
        // },
        // posthog: {
        //     host: 'https://us.posthog.com',
        //     key: 'phc_56789012345678901234567890123456',
        // },
    },
};

export const defaultAppConfig = isDev || isTestnet ? testConfig : mainnetConfig;
