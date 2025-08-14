import { useAtomValue } from 'jotai';
import { parseUnits } from 'viem';

import { rawAmountAtom } from '@/service/stores/bridge.store';
import { useSelectedToken } from '@/service/stores/token.store';

export const useWeiAmount = () => {
    const rawAmount = useAtomValue(rawAmountAtom);
    const token = useSelectedToken();

    if (!token) {
        return BigInt(0);
    }

    const amount = isNaN(parseFloat(rawAmount)) ? '0' : rawAmount;
    try {
        return parseUnits(amount, token.decimals);
    } catch {
        return BigInt(0);
    }
};
