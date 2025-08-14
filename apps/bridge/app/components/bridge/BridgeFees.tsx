import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { RouteProvider } from '@/common/consts/route-provider';
import { useBridgeGasEstimateForRoute } from '@/hooks/fees/use-bridge-gas-estimate';
import { useDeduplicatedFeeTokens, useFeesForRoute, useTotalFiatValue, useTotalTokenValue } from '@/hooks/fees/use-fee';
import { useNetworkFeeForGasLimit } from '@/hooks/fees/use-network-fee';
import { useChains, useFromChain, useToChain } from '@/hooks/use-chains';
import { checkMinGasLimit } from '@/service/apis/gas.api';
import { RouteQuoteDto } from '@/service/models/route.model';
import { isRouteTransactionStep } from '@/utils/guards';

// import { log } from '@/utils/log';

// import { log } from '@/utils/log';

import { OIcon } from '../icons/OIcon';
import { GasFeePill, Pill } from '../ui/pill';

// import { useSelectedBridgeRoute } from '@/hooks/routes/use-selected-bridge-route';

const Fees = ({ provider, quote }: { provider: RouteProvider; quote: RouteQuoteDto }) => {
    const { t } = useTranslation();
    const from = useFromChain();
    // const feeBreakdownModal = useModal("FeeBreakdown");

    const fees = useFeesForRoute({
        isLoading: false,
        data: { id: provider, result: quote },
    });

    const totalFiat = useTotalFiatValue(fees.data);
    const totalToken = useTotalTokenValue(fees.data, from);
    const feeTokens = useDeduplicatedFeeTokens(fees.data);

    // log('BridgeFees', totalFiat, totalToken, feeTokens);

    return (
        <div
            className={clsx(
                'flex gap-0.5 items-start justify-start flex-wrap',
                // allowDetailClicks && fees.data.length !== 0 && 'cursor-pointer group',
                'text-xs leading-none text-muted-foreground group-hover:text-foreground'
            )}
            // onClick={() => (allowDetailClicks && fees.data.length ? feeBreakdownModal.open() : null)}
        >
            {fees.data.length === 0 ? (
                <Pill>No extra fees</Pill>
            ) : !!totalFiat ? (
                <Pill className="group-hover:text-foreground">
                    {feeTokens.map(({ token }) => (
                        <OIcon
                            key={`${token.chainId}-${token.address}`}
                            type="TOKEN"
                            iconId={token.symbol}
                            className="-ml-1"
                        />
                    ))}
                    {totalFiat.formatted} {t('general.fee')}
                </Pill>
            ) : !!totalToken ? (
                <Pill className="group-hover:text-foreground">
                    {feeTokens.map(({ token }) => (
                        <OIcon
                            key={`${token.chainId}-${token.address}`}
                            type="TOKEN"
                            iconId={token.symbol}
                            className="-ml-1"
                        />
                    ))}
                    {totalToken.formatted} {t('general.fee')}
                </Pill>
            ) : (
                <>
                    {feeTokens.map(({ token, tokenTotal, fiatTotal }, index) => (
                        <>
                            <Pill className="group-hover:text-foreground">
                                <OIcon
                                    key={`${token.chainId}-${token.address}`}
                                    type="TOKEN"
                                    iconId={token.symbol}
                                    className="-ml-1"
                                />
                                <span>{fiatTotal?.formatted || tokenTotal.formatted}</span>
                                {t('general.fee')}
                            </Pill>

                            {index < feeTokens.length - 1 && (
                                <Pill className="group-hover:text-foreground" key={`divider-${index}`}>
                                    +
                                </Pill>
                            )}
                        </>
                    ))}
                </>
            )}
        </div>
    );
};

const GasFees = ({ provider, quote }: { provider: RouteProvider; quote: RouteQuoteDto }) => {
    const to = useToChain();
    const chains = useChains();
    // const gasInfoModal = useModal("GasInfo");

    const { data: gasLimit } = useBridgeGasEstimateForRoute({
        id: provider,
        result: quote,
    });

    const txSteps = quote.steps.filter((step) => isRouteTransactionStep(step));
    const txStepCount = txSteps.length;

    const initiatingChainNetworkFees = useNetworkFeeForGasLimit(txSteps[0]?.chainId, gasLimit);

    const receivingTxStepCount = txSteps.slice(1).filter((step) => step.chainId === to?.chainId).length;
    const receivingChainGasLimit = txSteps.slice(1).reduce((accum, step) => accum + (step.estimatedGasLimit ?? 0), 0);
    const receivingChainId = txSteps[txSteps.length - 1].chainId;
    const receivingChainNetworkFees = useNetworkFeeForGasLimit(
        receivingChainId,
        checkMinGasLimit(receivingChainId, BigInt(Math.round(receivingChainGasLimit)))
    );

    return (
        <div
            className={clsx(
                'flex gap-0.5 items-start justify-end flex-wrap',
                //   allowDetailClicks && "cursor-pointer group",
                'text-xs leading-none text-muted-foreground group-hover:text-foreground'
            )}
            // onClick={() => (allowDetailClicks ? gasInfoModal.open() : null)}
        >
            {txStepCount === 1 ? (
                <GasFeePill
                    networkFee={initiatingChainNetworkFees}
                    chain={chains.find((c) => c.chainId?.toString() === txSteps[0]?.chainId)}
                />
            ) : (
                <>
                    <GasFeePill
                        networkFee={initiatingChainNetworkFees}
                        chain={chains.find((c) => c.chainId?.toString() === txSteps[0]?.chainId)}
                        showChainIcon
                    />
                    <div className="shrink-0 flex items-center px-2 py-1.5 h-7 leading-none bg-muted rounded-full text-xs">
                        <span>+</span>
                    </div>
                    <GasFeePill
                        networkFee={receivingChainNetworkFees}
                        chain={chains.find((c) => c.chainId?.toString() === txSteps[txSteps.length - 1]?.chainId)}
                        showChainIcon
                        txStepCount={receivingTxStepCount}
                    />
                </>
            )}
        </div>
    );
};

export const BridgeFees = ({ provider, quote }: { provider: RouteProvider; quote: RouteQuoteDto }) => {
    return (
        <div className="flex justify-between items-center text-xs text-t4 mt-[20px]">
            <Fees provider={provider} quote={quote} />
            <GasFees provider={provider} quote={quote} />
        </div>
    );
};
