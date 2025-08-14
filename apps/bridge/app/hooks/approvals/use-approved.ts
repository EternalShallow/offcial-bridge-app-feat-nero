import { useWeiAmount } from '@/hooks/amount/use-wei-amount';
import { useAllowance } from '@/hooks/approvals/use-allowance';
import { useBridgeSubmitted } from '@/service/stores/bridge.store';

export const useApproved = () => {
    const allowance = useAllowance();
    const bridgeSubmitted = useBridgeSubmitted();
    const weiAmount = useWeiAmount();

    if (bridgeSubmitted) {
        return true;
    }

    return typeof allowance.data !== 'undefined' && allowance.data >= weiAmount;
};
