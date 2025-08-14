import { ethAddress, isAddress, isAddressEqual, zeroAddress } from 'viem';

import { Token } from '@/service/models/token.model';

export const deadAddress = '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000';

export interface MultiChainToken {
    [chainId: number]: Token | undefined;
}

export const isEth = (token?: Token | null) => {
    if (!token) {
        return false;
    }
    return (
        isAddress(token.address) &&
        (isAddressEqual(token.address, zeroAddress) ||
            isAddressEqual(token.address, ethAddress) ||
            isAddressEqual(token.address, deadAddress))
    );
};

export const isNativeToken = (token: MultiChainToken | null) => {
    if (!token) return false;

    for (const chainId in token) {
        const address = token[chainId]?.address;
        if (address && isAddress(address) && isAddressEqual(zeroAddress, address)) return true;
        if (address && isAddress(address) && isAddressEqual(deadAddress, address)) return true;
    }

    return false;
};
