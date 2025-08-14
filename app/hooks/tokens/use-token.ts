import { useMemo } from 'react';

import { useTxFromTo } from '@/hooks/tx/use-tx-from-to';
import { useClientState } from '@/service/hooks/use-state-client';
import { TokenType } from '@/service/models/token.model';
import { Transaction } from '@/service/models/transaction.model';
import { useFromChainId, useToChainId } from '@/service/stores/bridge.store';
import { isAddressEqual } from '@/utils/is-address-equal';

export { useSelectedToken, useDestinationToken } from '@/service/stores/token.store';

export const useSelectedTokens = () => {
    const { tokens } = useClientState();
    const fromChainId = useFromChainId();

    return useMemo(() => {
        if (!fromChainId) {
            return [];
        }
        return tokens[fromChainId].filter((t) => t.tokenType !== TokenType.WRAPPED);
    }, [tokens, fromChainId]);
};

export const useDestinationTokens = () => {
    const { tokens } = useClientState();
    const toChainId = useToChainId();

    return useMemo(() => {
        if (!toChainId) {
            return [];
        }
        return tokens[toChainId];
    }, [tokens, toChainId]);
};

export const useTxToken = (tx?: Transaction) => {
    const chains = useTxFromTo(tx);
    const { tokens } = useClientState();

    return useMemo(() => {
        if (!chains) {
            return;
        }

        return tokens[+chains.from.chainId].find((t) => isAddressEqual(t.address, tx?.token));
    }, [chains, tokens, tx?.token]);
};

export const useWrappedToken = () => {
    const { tokens } = useClientState();

    return useMemo(() => {
        return (chainId: number, address: string) => {
            if (!tokens[chainId]) {
                return null;
            }
            return tokens[chainId].find((t) => t.address === address && t.tokenType === TokenType.WRAPPED);
        };
    }, [tokens]);
};

export const useBridgedToken = () => {
    const { tokens } = useClientState();

    return useMemo(() => {
        return (chainId: number, address: string) => {
            if (!tokens[chainId]) {
                return null;
            }
            return tokens[chainId].find((t) => t.address === address && t.tokenType === TokenType.BRIDGED);
        };
    }, [tokens]);
};
