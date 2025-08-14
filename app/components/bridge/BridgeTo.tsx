import { useAtom } from 'jotai';

import { toChainIdAtom } from '@/service/stores/bridge.store';

import { BridgeSelect } from './BridgeSelect';

export const BridgeTo = () => {
    const [toChainId, setToChainId] = useAtom(toChainIdAtom);

    return <BridgeSelect title="To" chainId={toChainId} onChange={setToChainId} />;
};
