import { useMemo, useState } from 'react';

import { formatUnits } from 'viem';

import { OIcon } from '@/components/icons/OIcon';
import { SmallPill } from '@/components/ui/pill';
import { useTokenBalances } from '@/hooks/balances/use-token-balances';
import { useDestinationTokens } from '@/hooks/tokens/use-token';
import { useModal } from '@/hooks/use-modal';
import { useTrackEvent } from '@/hooks/use-track-event';
import { Token, TokenType } from '@/service/models/token.model';
import { useSetRawAmount } from '@/service/stores/bridge.store';
import { useSetDestinationToken, useSetSelectedToken } from '@/service/stores/token.store';
import { formatDecimals, formatToCurrency } from '@/utils/format-decimals';

import { BaseSelectItem, CommonSelectModal } from './CommonSelectModal';

const popularTokenSymbols = ['ETH', 'USDT', 'USDC'];

interface TokenBalance {
    token: Token;
    balance: bigint;
    usdValue: number;
}
interface TokenSelectItem extends TokenBalance, BaseSelectItem {}

export const TokenSelectModal = () => {
    const trackEvent = useTrackEvent();
    const { isOpen, close, data } = useModal('TokenSelect');
    const type = data as 'from' | 'to' | undefined;
    const setFromToken = useSetSelectedToken();
    const setToToken = useSetDestinationToken();
    const destinationTokens = useDestinationTokens();
    const setRawAmount = useSetRawAmount();
    const [keyword, setKeyword] = useState('');
    const { data: tokenBalances, isLoading } = useTokenBalances(type);

    const { popularTokens, filteredTokens } = useMemo(() => {
        const lowerCaseKeyword = keyword.toLowerCase();
        const all: TokenSelectItem[] =
            tokenBalances?.map((t) => ({
                ...t,
                id: t.token.address,
            })) || [];

        const filtered = all.filter(
            (t) =>
                t.token.name.toLowerCase().includes(lowerCaseKeyword) ||
                t.token.symbol.toLowerCase().includes(lowerCaseKeyword)
        );
        const popular = all.filter((t) => popularTokenSymbols.includes(t.token.symbol));

        return { popularTokens: popular, filteredTokens: filtered };
    }, [tokenBalances, keyword]);

    const handleSelectToken = (tokenBalance: TokenSelectItem) => {
        if (tokenBalance.balance === 0n) {
            setRawAmount('');
        }

        if (type === 'from') {
            setFromToken(tokenBalance.token);
            const toToken =
                destinationTokens.find(
                    (t) => t.coinKey === tokenBalance.token.coinKey && t.tokenType === TokenType.WRAPPED
                ) || destinationTokens.find((t) => t.coinKey === tokenBalance.token.coinKey);
            if (toToken) {
                setToToken(toToken);
            }
        } else if (type === 'to') {
            setToToken(tokenBalance.token);
        }

        trackEvent({
            event: 'token-select',
            symbol: tokenBalance.token.symbol,
            network: tokenBalance.token.chainId ?? '',
        });
    };

    const renderItem = (item: TokenSelectItem) => (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                {item.token.tokenType === TokenType.BRIDGED ? (
                    <OIcon type="BRIDGE_TOKEN" iconId={item.token.symbol} size={10} />
                ) : (
                    <OIcon type="TOKEN" iconId={item.token.symbol} size={10} />
                )}
                <div className="flex flex-col">
                    <span className="text-base font-bold text-t1">{item.token.symbol}</span>
                    <span className="text-sm text-gray-400">{item.token.name}</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-base font-bold text-t1">
                    {formatDecimals(Number(formatUnits(item.balance, item.token.decimals)))}
                </span>
                <span className="text-sm text-gray-400">{formatToCurrency(item.usdValue)}</span>
            </div>
        </div>
    );

    const renderPopularItem = (item: TokenSelectItem, onSelect: (item: TokenSelectItem) => void) => (
        <button
            key={item.token.address}
            onClick={() => onSelect(item)}
            className="rounded-full transition-opacity hover:opacity-80"
        >
            <SmallPill className="h-[24px]">
                {item.token.tokenType === TokenType.BRIDGED ? (
                    <OIcon type="BRIDGE_TOKEN" iconId={item.token.symbol} size={6} />
                ) : (
                    <OIcon type="TOKEN" iconId={item.token.symbol} size={6} />
                )}
                <span className="text-xs">{item.token.symbol}</span>
            </SmallPill>
        </button>
    );

    return (
        <CommonSelectModal<TokenSelectItem>
            isOpen={isOpen}
            onClose={close}
            title="Select a token"
            items={filteredTokens}
            renderItem={renderItem}
            onSelectItem={handleSelectToken}
            searchPlaceholder="Search token"
            popularItems={popularTokens}
            renderPopularItem={renderPopularItem}
            keyword={keyword}
            onKeywordChange={setKeyword}
            isLoading={isLoading}
        />
    );
};
