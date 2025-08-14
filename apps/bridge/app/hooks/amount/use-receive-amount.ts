import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { useSelectedToken } from '@/service/stores/token.store';

import { useGetFormattedAmount } from './use-get-formatted-amount';

export const useReceiveAmount = () => {
    const route = useSelectedBridgeRoute();
    const token = useSelectedToken();
    const getFormattedAmount = useGetFormattedAmount(token);

    return {
        data: getFormattedAmount(route?.data?.result?.receive ?? '0'),
        isLoading: false,
    };
};
