import { RouteResultDto } from '@/service/models/route.model';
import { Transaction } from '@/service/models/transaction.model';
import { Period, getPeriod } from '@/utils/get-period';
import { isRouteWaitStep } from '@/utils/guards';

export const useTxDuration = (tx: Transaction | undefined | null): number => {
    // const token = useTxToken(tx);
    // const chains = useTxFromTo(tx);
    if (!tx || !tx.duration) return 0;

    // if (isDeposit(tx)) return deployment?.depositDuration;
    // if (isOptimismWithdrawal(tx))
    //   return (
    //     (deployment?.proveDuration ?? 0) + (deployment?.finalizeDuration ?? 0)
    //   );
    // if (isOptimismForcedWithdrawal(tx))
    //   return (
    //     (deployment?.depositDuration ?? 0) +
    //     (deployment?.proveDuration ?? 0) +
    //     (deployment?.finalizeDuration ?? 0)
    //   );

    // if (isArbitrumWithdrawal(tx)) return deployment?.finalizeDuration;
    // if (isLzBridge(tx)) {
    //   return lzDurationOverride(chains?.from, chains?.to, token);
    // }
    return tx.duration;
};

export const getTxDurationForRoute = (route?: RouteResultDto | null): number => {
    if (!route?.result) return 0;
    if (route.result.steps.length === 0) return 0;
    if (route.result.duration) return route.result.duration;
    return route.result.steps.reduce((accum, x) => (isRouteWaitStep(x) ? x.duration + accum : accum), 0);
};

export const getTxBridgeDuration = (route?: RouteResultDto | null): Period | null => {
    if (!route) return null;
    const ms = getTxDurationForRoute(route);
    return getPeriod(ms / 1000);
};
