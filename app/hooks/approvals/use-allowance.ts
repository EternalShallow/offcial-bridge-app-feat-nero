import { Address, erc20Abi } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { useSelectedToken } from '@/service/stores/token.store';
import { isEth } from '@/utils/tokens/is-eth';

import { useApprovalAddress } from './use-approval-address';

export function useAllowance() {
    const token = useSelectedToken();
    const account = useAccount();
    const approvalAddress = useApprovalAddress();

    const allowance = useReadContract({
        abi: erc20Abi,
        functionName: 'allowance',
        args: [account.address as Address, approvalAddress as Address],
        address: (token?.address as Address) ?? '0x',
        query: {
            enabled: !!token && !!account.address && !isEth(token) && !!approvalAddress && !!token?.chainId,
            refetchInterval: 10_000,
        },
        chainId: parseInt(token?.chainId?.toString() || '0'),
    });

    // console.log('【useAllowance】', approvalAddress, allowance.data);

    return allowance;
}
