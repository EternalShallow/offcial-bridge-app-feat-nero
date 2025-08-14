import { atom, useAtomValue, useSetAtom } from 'jotai';

import { RouteProvider } from '@/common/consts/route-provider';

// route state
export const selectedRouteAtom = atom<RouteProvider | null>(null);
export const useSelectedRoute = () => useAtomValue(selectedRouteAtom);
export const useSetSelectedRoute = () => useSetAtom(selectedRouteAtom);
