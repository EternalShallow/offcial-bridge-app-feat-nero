import { ApiResponse, api } from '@/common/providers/query.provider';

import { RouteResultDto } from '../models/route.model';

export interface GetBridgeRoutesParams {
    host: string;
    amount: string;
    fromChainId: string;
    toChainId: string;
    fromTokenAddress: string;
    toTokenAddress: string;
    recipient: string;
    sender: string;
    // fromTokenDecimals: number;
    // toTokenDecimals: number;
    // fromGasPrice: string;
    // toGasPrice: string;
    // graffiti: string;
}

export const getBridgeRoutes = async (params: GetBridgeRoutesParams): ApiResponse<RouteResultDto[]> => {
    const response = await api.post('/bridge/routes', params);

    return response.data;
};
