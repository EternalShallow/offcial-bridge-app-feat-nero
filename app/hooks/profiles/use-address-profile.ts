import { useMemo } from 'react';

import { ChainDto } from '@/service/models/chain.model';

import { useEvmProfile } from './use-evm-profile';

export const useAddressProfile = (chain: ChainDto | null | undefined, address: string | null | undefined) => {
    const evmProfile = useEvmProfile(address, !!chain);

    return useMemo(() => {
        return {
            isFetching: evmProfile.isFetching,
            data: evmProfile.data,
        };
    }, [evmProfile.isFetching, evmProfile.data]);
};
