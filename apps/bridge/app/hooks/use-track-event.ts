import { sendGAEvent } from '@next/third-parties/google';

import { isDev } from '@/common/consts/env';
import { depositRoutes, RouteProvider } from '@/common/consts/route-provider';
import { useClientState } from '@/service/hooks/use-state-client';
import { useRawAmount } from '@/service/stores/bridge.store';
import { log } from '@/utils/log';

import { useSelectedToken } from './tokens/use-token';
import { useFromChain } from './use-chains';
import { useToChain } from './use-chains';
import { useIsWithdrawal } from './use-is-withdrawal';

type FromChainSelect = {
    event: 'from-chain-select';
    name: string;
    id: string;
};
type ToChainSelect = {
    event: 'to-chain-select';
    name: string;
    id: string;
};
type TokenSelect = {
    event: 'token-select';
    symbol: string;
    network: string;
};
type HighlightedTokenSelect = {
    event: 'highlighted-token-select';
    symbol: string;
    network: string;
};
type TokenBannerClick = {
    event: 'token-banner-click';
    symbol: string;
};
type Bridge = {
    event: 'bridge';
    from: string;
    to: string;
    amount: number;
    token: string;
    type: string;
    transactionHash: string;
};
type OpenActivity = {
    event: 'open-activity';
};
type CloseActivity = {
    event: 'close-activity';
};
type ClickDeposit = {
    event: 'click-deposit';
    name: string;
};
type ClickWithdraw = {
    event: 'click-withdraw';
    name: string;
};
type SelectLanguage = {
    event: 'select-language';
    name: string;
};
// type ProveWithdrawal = {
//     event: 'prove-withdrawal';
//     network: string;
//     originNetwork: string;
//     withdrawalTransactionHash: string;
// };
// type FinalizeWithdrawal = {
//     event: 'finalize-withdrawal';
//     network: string;
//     originNetwork: string;
//     withdrawalTransactionHash: string;
// };

export const useTrackEvent = () => {
    const { thirdParty } = useClientState();

    return (
        args:
            | FromChainSelect
            | ToChainSelect
            | TokenSelect
            | HighlightedTokenSelect
            | TokenBannerClick
            | Bridge
            | OpenActivity
            | CloseActivity
            | ClickDeposit
            | ClickWithdraw
            | SelectLanguage
    ) => {
        if (isDev || typeof window === 'undefined') return log('trackEvent', args.event);

        if (thirdParty?.googleAnalytics?.gId) {
            sendGAEvent('event', args.event, args);
        }
        // if (metadata.postHogHost && metadata.postHogKey) {
        //   import("posthog-js").then(({ posthog }) =>
        //     posthog.capture(args.event, { ...args })
        //   );
        // }
    };
};

export const useTrackBridgeEvent = () => {
    const trackEvent = useTrackEvent();
    const withdrawing = useIsWithdrawal();
    const from = useFromChain();
    const to = useToChain();
    const token = useSelectedToken();
    const rawAmount = useRawAmount();

    return (provider: RouteProvider, hash: string) => {
        if (isDev || typeof window === 'undefined') return log('trackBridgeEvent', provider, hash);
        if (!from || !to || !token) return;

        // legacy events. everything new is just done by provider
        const type = withdrawing
            ? 'withdraw'
            : depositRoutes.includes(provider)
              ? 'deposit'
              : provider.toLowerCase();

        trackEvent({
            event: 'bridge',
            from: from.name,
            to: to.name,
            amount: parseFloat(rawAmount),
            token: token.symbol,
            type,
            transactionHash: hash,
        });
    };
};
