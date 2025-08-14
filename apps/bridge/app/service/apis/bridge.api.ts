import { ApiResponseData, bridgeConfigApi } from '@/common/providers/query.provider';

import { BridgeConfigDto } from '../models/bridge.model';

export interface GetBridgeConfigParams {
    host: string;
}

export const getBridgeConfig = async (params: GetBridgeConfigParams) => {
    const response = await bridgeConfigApi.post('/bridge/config', params);
    return response.data as ApiResponseData<BridgeConfigDto>;
};
