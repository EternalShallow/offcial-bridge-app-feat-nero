import { BridgeConfigDto } from './bridge.model';
import { Token } from './token.model';

export interface InjectedState extends BridgeConfigDto {
    host: string;
    fromChainId?: number;
    toChainId?: number;
    defaultFromToken?: Token;
    defaultToToken?: Token;
}
