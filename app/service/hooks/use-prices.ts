import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import { zeroAddress } from 'viem';

import { getBridgeTokens } from '../apis/token.api';
import { Token } from '../models/token.model';

export const useGetTokenPrice = () => {
    const { data } = useQuery({
        queryKey: ['token_prices'],
        queryFn: () => getBridgeTokens(),
        refetchInterval: 1000 * 30,
    });

    return useCallback(
        (token: Token | null) => {
            if (!token || token?.address?.toLowerCase() == zeroAddress) {
                return null;
            }

            // return data?.data?.[`ethereum:${token?.address?.toLowerCase()}`]?.price ?? null;
            return data?.data?.[token?.symbol?.toUpperCase()] ?? null;
        },
        [data]
    );
};

export const useGetTokenPriceByKey = (coinKey: string) => {
    const { data, isLoading } = useQuery({
        queryKey: ['token_prices', coinKey],
        queryFn: () => {
            if (!coinKey) return null;
            return getBridgeTokens(coinKey);
        },
        refetchInterval: 1000 * 30,
    });

    return {
        data: data?.data,
        isLoading,
    };
};

export const useTokenPrice = (t?: Token) => {
    const getTokenPrice = useGetTokenPrice();
    if (!t) return null;

    return getTokenPrice(t);
};
