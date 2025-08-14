import { useWeiAmount } from '@/hooks/amount/use-wei-amount';
import { useSelectedToken } from '@/service/stores/token.store';

import { useTokenBalance } from './use-token-balance';

export const useHasInsufficientBalance = () => {
    const token = useSelectedToken();
    const tokenBalance = useTokenBalance(token);
    const weiAmount = useWeiAmount();

    return !tokenBalance.isLoading && weiAmount > tokenBalance.data;
};
