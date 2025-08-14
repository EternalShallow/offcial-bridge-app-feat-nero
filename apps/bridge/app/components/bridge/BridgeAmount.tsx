import { useAtomValue } from 'jotai';

import { useReceiveAmount } from '@/hooks/amount/use-receive-amount';
import { useDestinationTokens } from '@/hooks/tokens/use-token';
import { TokenType } from '@/service/models/token.model';
import { toChainIdAtom, useIsWrap, useSetIsWrap } from '@/service/stores/bridge.store';
import { useSelectedToken, useSetDestinationToken } from '@/service/stores/token.store';

import { OIcon } from '../icons/OIcon';
import { Button } from '../ui/button';
import { useChain } from '@/hooks/use-chains';

export const BridgeAmount = () => {
    const token = useSelectedToken();
    const toChainId = useAtomValue(toChainIdAtom);
    const toChain = useChain(toChainId)
    const receive = useReceiveAmount();
    const setToToken = useSetDestinationToken();
    const destinationTokens = useDestinationTokens();
    const isWrap = useIsWrap();
    const setIsWrap = useSetIsWrap();

    const doWrap = () => {
        const type = isWrap ? TokenType.BRIDGED : TokenType.WRAPPED;
        const toToken = destinationTokens.find((t) => t.coinKey === token?.coinKey && t.tokenType === type);

        if (toToken) {
            setIsWrap(!isWrap);
            setToToken(toToken);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                <OIcon type="TOKEN" iconId={token?.symbol} size={12} />
                <OIcon
                    type="CHAIN"
                    iconId={toChainId?.toString()}
                    containerClassName="absolute -bottom-1 -right-1 rounded-md bg-bg2 border border-bg1"
                    className="rounded-md"
                    size={5}
                />
            </div>

            <div className="flex flex-col gap-2">
                <span>
                    <span className="text-2xl leading-none">{receive.data?.token.formatted}</span>
                    <Button variant="linkGradient" size="sm" className="text-2xl py-0 px-1" onClick={doWrap}>
                        {token?.symbol}
                    </Button>
                    {!isWrap && toChain?.links?.unwrapUrl && <span className="text-xs text-t3">(unwrap)</span>}
                </span>
                {receive.data?.fiat && (
                    <span className="text-xs leading-none text-t3">{receive.data.fiat.formatted}</span>
                )}
            </div>
        </div>
    );
};
