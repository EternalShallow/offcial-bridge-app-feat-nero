import { useAccount } from 'wagmi';

import { useIsContractAccount } from '../account/use-is-contract-account';

export const useRecipient = () => {
    const evmAddress = useAccount().address;
    const isContractAccount = useIsContractAccount();
    if (isContractAccount) return undefined;

    return evmAddress;
};

export const useSender = () => {
    const evmAddress = useAccount().address;

    return evmAddress;
};
