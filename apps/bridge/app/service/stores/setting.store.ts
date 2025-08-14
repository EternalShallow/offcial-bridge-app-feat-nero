import { useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Address, isAddressEqual } from 'viem';

// Rejected calls update atom
const rejectedCallsUpdateAtom = atomWithStorage<Address[]>('rejectedCallsUpdate', []);
export const useRejectedCallsUpdate = () => useAtomValue(rejectedCallsUpdateAtom);
export const useSetRejectedCallsUpdate = () => useSetAtom(rejectedCallsUpdateAtom);

// Slippage atom
const slippageAtom = atomWithStorage<number>('slippage', 1);
export const useSlippage = () => useAtomValue(slippageAtom);
export const useSetSlippage = () => useSetAtom(slippageAtom);

// Custom hook to add rejected calls update
export const useAddRejectedCallsUpdate = () => {
    const rejectedCalls = useRejectedCallsUpdate();
    const setRejectedCallsUpdate = useSetRejectedCallsUpdate();

    return (address: Address) => {
        // Check if address already exists
        if (rejectedCalls.find((a) => isAddressEqual(a, address))) {
            return;
        }

        // Add new address to the list
        setRejectedCallsUpdate([...rejectedCalls, address]);
    };
};
