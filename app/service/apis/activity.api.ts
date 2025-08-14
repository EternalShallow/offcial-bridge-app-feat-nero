import { ApiResponse, api } from '@/common/providers/query.provider';

import { BridgeActivity, TransactionDto } from '../models/transaction.model';

export interface GetBridgeActivityParams {
    cursor: string | null;
    evmAddress: string;
}

export const getBridgeActivity = async (params: GetBridgeActivityParams): ApiResponse<BridgeActivity> => {
    const response = await api.post('/bridge/activity', params);

    return response.data;
};

// useGetFinaliseTransaction

export const getFinaliseTransaction = async (params: { id: string }): ApiResponse<TransactionDto> => {
    const response = await api.post('/bridge/finalise', params);

    return response.data;
};
