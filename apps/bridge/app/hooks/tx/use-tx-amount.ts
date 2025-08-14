import { formatUnits } from 'viem';

import { Token } from '@/service/models/token.model';
import { Transaction } from '@/service/models/transaction.model';
import { formatDecimals } from '@/utils/format-decimals';

export function useTxAmount(tx: Transaction | null | undefined, token: Token | null | undefined) {
    if (!tx || !token) {
        return null;
    }

    const amount = tx.amount;
    const decimals = token?.decimals ?? 18;
    const symbol = token?.symbol ?? 'ETH';

    const formatted = formatDecimals(parseFloat(formatUnits(BigInt(amount), decimals)));

    return {
        formatted,
        raw: amount,
        text: `${formatted} ${symbol}`,
    };
}
