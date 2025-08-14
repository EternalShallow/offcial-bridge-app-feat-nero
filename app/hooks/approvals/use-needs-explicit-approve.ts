// import { RouteProvider } from '@/common/consts/route-provider';
import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { isRouteQuote } from '@/utils/guards';

// import { useSupportsSendCalls } from '../account/use-is-contract-account';
import { useApproveTx } from './use-approve-tx';

export const useNeedsExplicitApprove = () => {
    const route = useSelectedBridgeRoute();
    // const supportsSendCalls = useSupportsSendCalls();
    const approveTx = useApproveTx(route.data);

    if (!isRouteQuote(route.data?.result)) return false;
    // if (supportsSendCalls) {
    //     // temp while we work out 7702 forced approvals
    //     if (route.data.id === RouteProvider.EniForcedWithdrawal && route.data.result.tokenApprovalAddress) {
    //         return true;
    //     }
    //     return false;
    // }
    return !!approveTx;
};
