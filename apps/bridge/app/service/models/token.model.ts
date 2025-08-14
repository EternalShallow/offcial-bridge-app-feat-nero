export enum TokenType {
    ERC20 = 'erc20',
    NATIVE = 'native',
    WRAPPED = 'wrapped',
    BRIDGED = 'bridged',
}

export interface Token {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
    tokenType?: TokenType | string;
    isNative?: boolean;
    chainId?: string;
    price?: number;
    timestamp?: number;
    logoURI?: string;
    confidence?: number;
    id?: string;
    coinKey?: string;
    iconUrl?: string | null;
}

export type PartialToken = Omit<Token, 'timestamp' | 'confidence'>;

export type MultiChainToken = {
    [chainId: number]: Token[];
};
