import { ApiResponse, api } from '@/common/providers/query.provider';

export const getBridgeTokens = async (coinKey?: string): ApiResponse<Record<string, number>> => {
    const response = await api.get('/token_prices', { params: coinKey ? { coinKey } : undefined });

    return response.data;
};
