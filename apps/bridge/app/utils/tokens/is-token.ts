import { Token } from '@/service/models/token.model';
import { TokenType } from '@/service/models/token.model';

export const isWrappedToken = (token: Token) => {
    return token.tokenType === TokenType.WRAPPED;
};

export const isBridgedToken = (token: Token) => {
    return token.tokenType === TokenType.BRIDGED;
};
