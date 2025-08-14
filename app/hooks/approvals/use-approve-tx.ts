import { encodeFunctionData } from 'viem';

import { RouteResultDto } from '@/service/models/route.model';
import { TransactionDto } from '@/service/models/transaction.model';
import { useSelectedToken } from '@/service/stores/token.store';
import { isEth } from '@/utils/tokens/is-eth';

// import { log } from '@/utils/log';

import { useWeiAmount } from '../amount/use-wei-amount';
import { useApprovalAddressForRoute, useApprovalTxForRoute } from './use-approval-address';

// Trying to approve USDT with the vanilla Wagmi ERC20 ABI
// causes problems because it doesn't return anything
export const APPROVE_ABI_WITHOUT_RETURN = [
    {
        type: 'function',
        name: 'approve',
        stateMutability: 'nonpayable',
        inputs: [
            {
                name: 'spender',
                type: 'address',
            },
            {
                name: 'amount',
                type: 'uint256',
            },
        ],
        outputs: [
            //   {
            //     name: "",
            //     type: "bool",
            //   },
        ],
    },
] as const;

export function useApproveTx(route: RouteResultDto | null): TransactionDto | null {
    const weiAmount = useWeiAmount();
    const approvalAddress = useApprovalAddressForRoute(route);
    const approvalTx = useApprovalTxForRoute(route);
    const token = useSelectedToken();

    if (!token || isEth(token)) {
        return null;
    }

    if (approvalTx) {
        return {
            ...approvalTx,
            chainId: approvalTx.chainId.toString(),
        };
    }

    // log('【useApproveTx】', approvalAddress, weiAmount);

    if (approvalAddress) {
        return {
            to: token.address!,
            value: '0x0',
            chainId: token.chainId!,
            data: encodeFunctionData({
                abi: APPROVE_ABI_WITHOUT_RETURN,
                functionName: 'approve',
                args: [approvalAddress, weiAmount],
            }),
        };
    }

    return null;
}

export function useApproveUsdtZeroData(route: RouteResultDto | null) {
    const approvalAddress = useApprovalAddressForRoute(route);

    // Check if approvalAddress is defined before encoding
    if (!approvalAddress) {
        return null;
    }

    const approveZeroData = encodeFunctionData({
        abi: APPROVE_ABI_WITHOUT_RETURN,
        functionName: 'approve',
        args: [approvalAddress, 0n],
    });
    return approveZeroData;
}
