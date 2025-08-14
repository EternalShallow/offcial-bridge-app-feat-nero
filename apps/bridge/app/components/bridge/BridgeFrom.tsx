import { useAtom } from 'jotai';
import { formatUnits } from 'viem';

import { DEFAULT_UNWRAP_URL } from '@/common/consts/global';
import { useFormatFiat } from '@/hooks/amount/use-fiat-amount';
import { useTokenBalance } from '@/hooks/balances/use-token-balance';
import { useFromChain } from '@/hooks/use-chains';
import { useSender } from '@/hooks/wallets/use-recipient';
import { useTokenPrice } from '@/service/hooks/use-prices';
import { TokenType } from '@/service/models/token.model';
import { fromChainIdAtom, rawAmountAtom } from '@/service/stores/bridge.store';
import { useSelectedToken } from '@/service/stores/token.store';
import { formatDecimals } from '@/utils/format-decimals';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { BridgeSelect } from './BridgeSelect';
import { TokenSelect } from './TokenSelect';

export const BridgeFrom = () => {
    const [fromChainId, setFromChainId] = useAtom(fromChainIdAtom);
    const fromChain = useFromChain();
    const [rawAmount, setRawAmount] = useAtom(rawAmountAtom);
    const token = useSelectedToken();
    // const [clickedMax, setClickedMax] = useState(false);
    const tokenBalance = useTokenBalance(token);
    const formatFiat = useFormatFiat();
    const sender = useSender();

    const formattedTokenBalance = formatUnits(tokenBalance.data, token?.decimals ?? 18);
    const displayTokenBalance = formatDecimals(parseFloat(formattedTokenBalance));
    const price = useTokenPrice(token);
    const fiatAmount = Number(rawAmount) * (price ?? 0);
    const formattedTokenBalanceUSD = formatFiat(fiatAmount);

    const onSetMax = () => {
        setRawAmount(displayTokenBalance);
    };

    return (
        <div className="rounded-2xl bg-gray-100 flex flex-col">
            <BridgeSelect title="From" chainId={fromChainId} onChange={setFromChainId} />
            <div className="px-4 py-5">
                <div className="flex justify-between items-center gap-4">
                    <input
                        value={rawAmount}
                        onChange={(e) => {
                            const parsed = e.target.value.replaceAll(',', '.');

                            if (/^[0-9]*[.]?[0-9]*$/.test(parsed)) {
                                const newDecimalGroups = parsed.split('.');
                                const oldDecimalGroups = rawAmount.split('.');
                                if (
                                    token &&
                                    newDecimalGroups.length > 1 &&
                                    newDecimalGroups[1].length > token.decimals
                                ) {
                                    // if someone switches to a token that doesn't have as many decimals
                                    // we should still let them backspace
                                    if (
                                        oldDecimalGroups.length > 1 &&
                                        newDecimalGroups[1].length > oldDecimalGroups[1].length
                                    ) {
                                        return;
                                    }
                                }

                                setRawAmount(parsed);
                            }

                            // setClickedMax(false);
                        }}
                        type="text"
                        inputMode="decimal"
                        minLength={1}
                        maxLength={79}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        pattern="^[0-9]*[.,]?[0-9]*$"
                        name="amount"
                        id="amount"
                        className={`block w-full shadow-none bg-transparent focus:outline-none text-4xl leading-[48px] placeholder:text-muted-foreground text-foreground`}
                        placeholder="0"
                    />
                    <TokenSelect />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {fiatAmount > 0 && (
                            <span className="text-xs text-muted-foreground">{formattedTokenBalanceUSD}</span>
                        )}
                    </div>

                    <div className="flex items-center">
                        {sender && (
                            <div className="flex items-center gap-2">
                                {tokenBalance.isLoading ? (
                                    <Skeleton className="h-4 w-[88px] bg-muted-foreground" />
                                ) : (
                                    <div className="flex justify-end text-xs text-muted-foreground">
                                        {displayTokenBalance} {token?.symbol}
                                    </div>
                                )}

                                <Button
                                    variant="linkGradient"
                                    size="sm"
                                    className="text-xs py-0 px-0"
                                    onClick={onSetMax}
                                    disabled={tokenBalance.isLoading || tokenBalance.data === 0n}
                                >
                                    Max
                                </Button>
                            </div>
                        )}

                        {token?.tokenType === TokenType.BRIDGED && fromChain?.links?.unwrapUrl && (
                            <div className="flex items-center ml-2">
                                <span className="text-muted-foreground">|</span>
                                <Button
                                    variant="link"
                                    size="xs"
                                    onClick={() => {
                                        window.open(fromChain?.links?.unwrapUrl || DEFAULT_UNWRAP_URL, '_blank');
                                    }}
                                >
                                    Unwrap now →
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
