import { formatUnits } from 'viem';

import { useTxToken } from '@/hooks/tokens/use-token';
import { useTxAmount } from '@/hooks/tx/use-tx-amount';
import { Token } from '@/service/models/token.model';
import { Transaction } from '@/service/models/transaction.model';
import { formatDecimals } from '@/utils/format-decimals';

export function useTxAmountOutput(tx?: Transaction, token?: Token) {
    const fromToken = useTxToken(tx);
    const inputAmount = useTxAmount(tx, token);

    if (!tx || !token || !fromToken) {
        return;
    }

    if (tx.receiveAmount) {
        const formatted = formatDecimals(parseFloat(formatUnits(BigInt(tx.receiveAmount), fromToken?.decimals ?? 18)));

        return {
            formatted,
            raw: tx.receiveAmount,
            text: `${formatted} ${token?.symbol ?? 'ETH'}`,
        };
    }

    return inputAmount;
}
