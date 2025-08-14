import { Token } from './token.model';

export interface ChainDto {
    chainId: string;
    name: string;
    nativeCurrency: Token;
    rpc?: string[];
    api?: string[];
    explorers: {
        name: string;
        url: string;
    }[];
    vm: string;
    iconUrl?: string;
    links?: {
        wrapUrl: string;
        unwrapUrl: string;
    };
}
