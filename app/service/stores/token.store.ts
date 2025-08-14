import { atom, useAtomValue, useSetAtom } from 'jotai';

import { Token } from '../models/token.model';

export const selectedTokenAtom = atom<Token>();
export const useSelectedToken = () => useAtomValue(selectedTokenAtom);
export const useSetSelectedToken = () => useSetAtom(selectedTokenAtom);

export const destinationTokenAtom = atom<Token>();
export const useDestinationToken = () => useAtomValue(destinationTokenAtom);
export const useSetDestinationToken = () => useSetAtom(destinationTokenAtom);
