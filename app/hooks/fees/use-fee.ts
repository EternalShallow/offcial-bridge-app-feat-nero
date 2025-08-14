import { isPresent } from 'ts-is-present';
import { Address, formatUnits } from 'viem';
import { ethAddress } from 'viem';

import { useGetTokenPrice } from '@/service/hooks/use-prices';
import { ChainDto } from '@/service/models/chain.model';
import { RouteResultDto } from '@/service/models/route.model';
import { PartialToken } from '@/service/models/token.model';
import { useSelectedToken } from '@/service/stores/token.store';
import { formatDecimals } from '@/utils/format-decimals';
import { isRouteQuote } from '@/utils/guards';
import { isAddressEqual } from '@/utils/is-address-equal';

// import { log } from '@/utils/log';

import { useFormatFiat } from '../amount/use-fiat-amount';
import { useFromChain, useToChain } from '../use-chains';

type Fee = {
    name: string;
    token: {
        token: PartialToken;
        formatted: string;
        amount: number;
    };
    fiat: {
        formatted: string;
        amount: number;
    } | null;
};

export const useTotalFiatValue = (fees: Fee[]) => {
    const formatFiat = useFormatFiat();

    if (fees.length === 0) return null;

    const feeAccumulator = (acc: number | null, f: (typeof fees)[number]) => {
        if (typeof acc === 'number') {
            if (f.fiat) return f.fiat.amount + acc;
            else return null;
        }
        return null;
    };
    const total = fees.reduce(feeAccumulator, 0);
    if (total === null) {
        return null;
    }

    const formatted = formatFiat(total);

    // log('【Total Fees】', fees, total, formatted);

    return {
        total,
        formatted,
        tokens: fees.map((f) => f.token),
    };
};

export const useTotalTokenValue = (fees: Fee[], chain: ChainDto | undefined | null) => {
    if (fees.length === 0 || !chain) return null;

    const feeAccumulator = (acc: number | null, f: (typeof fees)[number]) => {
        if (typeof acc === 'number') {
            if (isAddressEqual(f.token.token.address, fees[0].token.token.address)) return f.token.amount + acc;
            else return null;
        }
        return null;
    };

    const total = fees.reduce(feeAccumulator, 0);
    if (total === null) {
        return null;
    }

    const formatted = `${formatDecimals(total)} ${fees[0].token.token.symbol}`;

    return { total, formatted, tokens: fees.map((f) => f.token) };
};

export const useDeduplicatedFeeTokens = (
    fees: Fee[]
): {
    token: PartialToken;
    tokenTotal: { amount: number; formatted: string };
    fiatTotal: { amount: number; formatted: string } | null;
}[] => {
    const formatFiat = useFormatFiat();

    const map = new Map<string, { token: PartialToken; tokenAmount: number; fiatAmount: number | null }>();

    for (const f of fees) {
        let value = map.get(f.token.token.symbol);

        if (!value) {
            value = {
                token: f.token.token,
                tokenAmount: f.token.amount,
                fiatAmount: f.fiat?.amount ?? null,
            };
        } else {
            value.tokenAmount += f.token.amount;
            if (value.fiatAmount !== null && f.fiat?.amount) {
                value.fiatAmount += f.fiat.amount;
            }
        }

        map.set(f.token.token.symbol, value);
    }

    return Array.from(map.values()).map(({ token, fiatAmount, tokenAmount }) => {
        const formattedTokenAmount = `${formatDecimals(tokenAmount)} ${token.symbol}`;

        return {
            token,

            tokenTotal: {
                amount: tokenAmount,
                formatted: formattedTokenAmount,
            },

            fiatTotal:
                fiatAmount !== null
                    ? {
                          amount: fiatAmount,
                          formatted: formatFiat(fiatAmount),
                      }
                    : null,
        };
    });
};

export const useFeesForRoute = (route: {
    isLoading: boolean;
    data: RouteResultDto | null;
}): {
    isLoading: boolean;
    data: Fee[];
} => {
    const fromToken = useSelectedToken();
    const getTokenPrice = useGetTokenPrice();
    const from = useFromChain();
    const to = useToChain();
    const formatFiat = useFormatFiat();

    const fees = isRouteQuote(route.data?.result)
        ? route.data.result.fees
              .map((x) => {
                  if (!from || !to || !from?.nativeCurrency || !to?.nativeCurrency) return null;

                  const feeToken = isAddressEqual(x.tokenAddress as Address, ethAddress)
                      ? {
                            ...from.nativeCurrency,
                            logoURI: '',
                            address: ethAddress,
                            chainId: from.chainId,
                            name: from.nativeCurrency.name,
                            symbol: from.nativeCurrency.symbol,
                            decimals: from.nativeCurrency.decimals ?? 18,
                        }
                      : to.nativeCurrency.address &&
                          isAddressEqual(x.tokenAddress as Address, to.nativeCurrency.address)
                        ? {
                              ...to.nativeCurrency,
                              address: to.nativeCurrency.address,
                              logoURI: to.iconUrl ?? '',
                              chainId: to.chainId,
                              name: to.nativeCurrency.name,
                              symbol: to.nativeCurrency.symbol,
                              decimals: to.nativeCurrency.decimals,
                          }
                        : fromToken;

                  if (!feeToken) return null;

                  //   log('【useFeesForRoute feeToken】', from, to, feeToken);

                  const amount = parseFloat(formatUnits(BigInt(x.amount), feeToken?.decimals ?? 18));
                  const price = getTokenPrice(feeToken);
                  const fiat = price ? amount * price : null;
                  const fiatFormatted = fiat ? formatFiat(fiat) : null;
                  const tokenFormatted = `${formatDecimals(amount)} ${feeToken?.symbol}`;

                  return {
                      name: x.name,
                      fiat: fiat !== null && fiatFormatted !== null ? { formatted: fiatFormatted, amount: fiat } : null,
                      token: {
                          formatted: tokenFormatted,
                          amount,
                          token: feeToken,
                      },
                  };
              })
              .filter(isPresent)
        : [];

    return {
        isLoading: route.isLoading,
        data: fees,
    };
};
