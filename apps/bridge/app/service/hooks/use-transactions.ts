import { useMemo } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { useEvmAddress } from '@/hooks/wallets/use-evm-address';

import { getBridgeActivity } from '../apis/activity.api';
import { Transaction } from '../models/transaction.model';

// import { useClientState } from './use-state-client';

export const useTransactions = () => {
    // const { id } = useClientState();
    const evmAddress = useEvmAddress();

    const { data, isLoading, isFetchingNextPage, isFetching, isError, fetchNextPage } = useInfiniteQuery({
        queryKey: ['bridge-activity', evmAddress],
        queryFn: ({ pageParam }) => {
            if (!evmAddress) {
                return {
                    inProgressCount: 0,
                    total: 0,
                    transactions: [] as Transaction[],
                };
            }
            return getBridgeActivity({
                evmAddress: evmAddress,
                cursor: pageParam || null,
            }).then((res) => res.data);
        },
        enabled: !!evmAddress,
        refetchInterval: 10000,
        getNextPageParam: (lastPage) => lastPage?.transactions?.[lastPage.transactions.length - 1]?.id,
        initialPageParam: '',
        staleTime: 1000 * 10, // 10 seconds
        gcTime: 1000 * 60, // 1 minute
    });

    return {
        data,
        transactions: useMemo(() => data?.pages.flatMap((page) => page.transactions) ?? [], [data?.pages]),
        isLoading,
        isFetchingNextPage,
        isFetching,
        isError,
        fetchNextPage,
        total: data?.pages?.[0]?.total ?? 0,
        inProgressCount: data?.pages?.[0]?.inProgressCount ?? 0,
    };
};
