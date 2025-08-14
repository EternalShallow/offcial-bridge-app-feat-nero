import { OB_BRIDGE_ID, OB_BRIDGE_TESTNET_ID } from '@/common/consts/ids';

export const isOfficialBridge = (id: string) => OB_BRIDGE_ID === id;
export const isOfficialBridgeTestnet = (id: string) => OB_BRIDGE_TESTNET_ID === id;
