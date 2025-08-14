import { useQuery } from '@tanstack/react-query';
import { isAddress } from 'viem';

import { resolveAddress, resolveName } from '@/service/apis/ens.api';

export const useEvmProfile = (input: string | null | undefined, enabled: boolean) => {
    const profile = useQuery({
        queryKey: ['evm profile', input],
        queryFn: async () => {
            if (!input) return null;

            if (input.endsWith('.eth')) {
                const profile = await resolveName(input);
                if (!profile) {
                    return null;
                }

                return {
                    name: input,
                    address: profile.address,
                    avatar: profile.avatar,
                };
            }

            if (!isAddress(input)) {
                return null;
            }

            const profile = await resolveAddress(input);
            if (profile) {
                return profile;
            }

            return {
                name: null,
                address: input,
                avatar: null,
            };
        },
        enabled: enabled && !!input && (isAddress(input) || input.endsWith('.eth')),
    });
    return profile;
};
