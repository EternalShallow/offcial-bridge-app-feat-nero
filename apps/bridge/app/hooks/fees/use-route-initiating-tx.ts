import { RouteResultDto } from '@/service/models/route.model';
import { TransactionDto } from '@/service/models/transaction.model';
import { isRouteQuote } from '@/utils/guards';

import { useWeiAmount } from '../amount/use-wei-amount';

export function useRouteInitiatingTx(route: RouteResultDto | null): TransactionDto | null {
    const weiAmount = useWeiAmount();

    if (!weiAmount || !route?.result || !isRouteQuote(route?.result)) {
        return null;
    }

    return route.result.initiatingTransaction;
}
