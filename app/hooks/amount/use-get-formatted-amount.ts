import { formatUnits } from 'viem';

import { useTokenPrice } from '@/service/hooks/use-prices';
import { Token } from '@/service/models/token.model';
import { formatDecimals } from '@/utils/format-decimals';

import { useFormatFiat } from './use-fiat-amount';

export const useGetFormattedAmount = (token?: Token) => {
    const usdPrice = useTokenPrice(token);
    const formatFiat = useFormatFiat();

    return (raw: string) => {
        if (!token) {
            return {
                fiat: null,
                token: { formatted: '--', amount: '--', raw },
            };
        }

        const amount = parseFloat(formatUnits(BigInt(raw ?? '0'), token?.decimals ?? 18));

        const fiat = usdPrice ? amount * usdPrice : null;
        const fiatFormatted = fiat ? formatFiat(fiat) : null;
        const tokenFormatted = formatDecimals(amount); // `${formatDecimals(amount)} ${token?.symbol}`

        // console.log('【useGetFormattedAmount】', usdPrice, token);

        return {
            fiat: fiat ? { formatted: fiatFormatted, amount: fiat } : null,
            token: { formatted: tokenFormatted, amount, raw },
        };
    };
};
