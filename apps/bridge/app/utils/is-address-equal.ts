import { isAddress, isAddressEqual as viemIsAddressEqual } from 'viem';

export const isAddressEqual = (aAddress: string | undefined | null, bAddress: string | undefined | null) => {
    if (!aAddress || !bAddress) return false;

    // if (aChain.solana || bChain.solana) {
    //   return aAddress === bAddress;
    // }

    return isAddress(aAddress) && isAddress(bAddress) && viemIsAddressEqual(aAddress, bAddress);
};
