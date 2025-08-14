import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { Address, isAddress, isAddressEqual } from 'viem';

import { Token } from '@/service/models/token.model';
import { useSetSelectedToken } from '@/service/stores/token.store';

import { useSelectedTokens } from './tokens/use-token';
import { useFromChain, useToChain } from './use-chains';

/**
 * Broken down
 *
 * recipient here
 * amount here
 * fromChainId injected
 * toChainId injected
 * widget injected
 * tokenAddress here
 *
 * /base injected
 * /usdc here
 * /base/usdc here
 */
export const useInitialiseQueryParams = () => {
    const searchParams = useSearchParams();
    const from = useFromChain();
    const to = useToChain();
    const tokens = useSelectedTokens();

    const setToken = useSetSelectedToken();

    useEffect(() => {
        if (!tokens?.length || !from || !to) {
            return;
        }

        // const [deploymentTokenUndefined, tokenUndefined]: (string | undefined)[] = router.asPath
        //     .split(/[?\/]/)
        //     .filter(Boolean);

        // const isLegacyRouteParams =
        //     (!!deploymentTokenUndefined || !!deploymentTokenUndefined) && !deploymentTokenUndefined.includes('&');

        let token: Token | undefined;

        const tokenAddress = searchParams.get('tokenAddress') as string | undefined;
        if (tokenAddress) {
            token = tokens.find((x) => {
                if (!x) {
                    return false;
                }

                if (isAddress(tokenAddress)) {
                    return isAddressEqual(tokenAddress, x.address as Address);
                }
            });
        }

        if (token) {
            setToken(token);
        }

        // if (isLegacyRouteParams) {
        //     token = tokens.find((x) => {
        //         const fromToken = x[from.chainId];
        //         const toToken = x[to.chainId];
        //         if (!fromToken || !toToken) {
        //             return;
        //         }

        //         if (deploymentTokenUndefined) {
        //             if (isAddress(deploymentTokenUndefined)) {
        //                 return isAddressEqual(deploymentTokenUndefined, fromToken.address as Address);
        //             }
        //             if (deploymentTokenUndefined.toLowerCase() === fromToken.symbol.toLowerCase()) {
        //                 return true;
        //             }
        //         }

        //         if (tokenUndefined) {
        //             if (isAddress(tokenUndefined)) {
        //                 return isAddressEqual(tokenUndefined, fromToken.address as Address);
        //             }

        //             return tokenUndefined.toLowerCase() === fromToken.symbol.toLowerCase();
        //         }
        //     });

        //     if (token) {
        //         setToken(token);
        //     }
        // } else {
        //     const tokenAddress = router.query.tokenAddress as string | undefined;
        //     if (tokenAddress) {
        //         token = tokens.data.find((x) => {
        //             const fromToken = x[from.id];
        //             const toToken = x[to.id];
        //             if (!fromToken || !toToken) {
        //                 return false;
        //             }

        //             if (isAddress(tokenAddress)) {
        //                 return isAddressEqual(tokenAddress, fromToken.address as Address);
        //             }
        //         });
        //     }

        //     if (token) {
        //         setToken(token);
        //     }
        // }
    }, [searchParams, tokens, from, to, setToken]);
};
