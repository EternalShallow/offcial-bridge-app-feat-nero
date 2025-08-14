import { useTranslation } from 'react-i18next';

import { useAddressMeta } from '@/components/bridge/BridgeInfo';
import { OIcon } from '@/components/icons/OIcon';
import { RouteProviderIcon, RouteProviderName } from '@/components/icons/route-provider-icon';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog2';
import { Skeleton } from '@/components/ui/skeleton';
import { useReceiveAmount } from '@/hooks/amount/use-receive-amount';
import { useDeduplicatedFeeTokens, useFeesForRoute } from '@/hooks/fees/use-fee';
import { useSelectedBridgeRoute } from '@/hooks/routes/use-bridge-route';
import { useApproxTotalBridgeTime } from '@/hooks/times/use-transfer-time';
import { useFromChain, useToChain } from '@/hooks/use-chains';
import { useTransformPeriodText } from '@/hooks/use-transform-period-text';
import { useRecipient, useSender } from '@/hooks/wallets/use-recipient';
import { useRawAmount } from '@/service/stores/bridge.store';
import { useDestinationToken, useSelectedToken } from '@/service/stores/token.store';

import { IconSimpleFees, IconTime, IconVia } from '../icons';

export const ConfirmationModalReviewTab = ({ onNext }: { onNext: () => void }) => {
    const { t } = useTranslation();
    const from = useFromChain();
    const to = useToChain();
    const rawAmount = useRawAmount();
    const selectedToken = useSelectedToken();
    const destinationToken = useDestinationToken();

    const sender = useSender();
    const recipient = useRecipient();
    const senderMeta = useAddressMeta(from, sender);
    const recipientMeta = useAddressMeta(to, recipient);
    const receive = useReceiveAmount();

    const route = useSelectedBridgeRoute();
    const fees = useFeesForRoute(route);
    const feeTokens = useDeduplicatedFeeTokens(fees.data);

    const approxTotalBridgeTime = useApproxTotalBridgeTime();
    const transformPeriodIntoText = useTransformPeriodText();
    const transferTime = transformPeriodIntoText('transferTime', {}, approxTotalBridgeTime.data);

    // console.log('[from, to]', from?.chainId, to?.chainId);

    if (!from || !to) return null;

    return (
        <>
            <div className="flex flex-col gap-2 py-3 px-6">
                <div className="flex flex-col gap-1">
                    {/* Send */}
                    <div className="flex flex-col gap-3 p-4 rounded-2xl justify-between bg-muted">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <OIcon
                                    type="CHAIN"
                                    iconId={from?.chainId.toString() ?? ''}
                                    size={5}
                                    className="rounded-md"
                                />
                                <span className="text-xs font-heading leading-none">
                                    {t('confirmationModal.bridgeFrom', { from: from?.name })}
                                </span>
                            </div>
                            <a
                                target="_blank"
                                href={senderMeta?.link ?? ''}
                                className="text-[10px] leading-none bg-card text-muted-foreground px-2 py-1 rounded-full"
                            >
                                {senderMeta?.formatted}
                            </a>
                        </div>
                        <div className="flex items-center gap-1 leading-none">
                            <OIcon type="TOKEN" iconId={selectedToken?.symbol} size={8} />
                            <span className="text-2xl leading-none">
                                {rawAmount} {selectedToken?.symbol}
                            </span>
                        </div>
                    </div>

                    {/* Receive */}
                    <div className="flex flex-col gap-3 p-4 rounded-2xl justify-between bg-muted">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <OIcon
                                    type="CHAIN"
                                    iconId={to?.chainId.toString() ?? ''}
                                    size={5}
                                    className="rounded-md"
                                />
                                <span className="text-xs font-heading leading-none">
                                    {t('confirmationModal.getOn', { to: to?.name })}
                                </span>
                            </div>
                            <a
                                target="_blank"
                                href={recipientMeta?.link ?? ''}
                                className="text-[10px] leading-none bg-card text-muted-foreground px-2 py-1 rounded-full"
                            >
                                {recipientMeta?.formatted}
                            </a>
                        </div>
                        <div className="flex items-center gap-1 leading-none">
                            <OIcon type="TOKEN" iconId={destinationToken?.symbol} size={8} />
                            <span className="text-2xl leading-none">
                                {receive.data ? `${receive.data.token.amount} ${destinationToken?.symbol}` : '…'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col divide-y divide-border rounded-2xl border py-0.5 text-xs">
                    {/* Via */}
                    <div className="flex items-start gap-4 py-3 px-3.5 justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <IconVia className="w-4 h-auto" />
                                <span>{t('transaction.via')}</span>
                            </div>
                        </div>
                        <div className="flex gap-1.5 items-center justify-between ">
                            <RouteProviderName provider={route.data?.id} />
                            <RouteProviderIcon provider={route.data?.id} className="h-4 w-4 rounded-md" />
                        </div>
                    </div>

                    {/* Time Row */}
                    <div className="flex items-start gap-4 py-3 px-3.5 justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                {/* <Hourglass className="w-4 h-auto fill-foreground" /> */}
                                <IconTime className="w-4 h-auto" />
                                <span>{t('transaction.transferTime')}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            {approxTotalBridgeTime.isLoading ? (
                                <Skeleton className="h-3 w-[60px]" />
                            ) : (
                                <span>{transferTime}</span>
                            )}
                        </div>
                    </div>

                    {/* Fees Row */}
                    <div className="flex gap-4 py-3 px-3.5 items-center justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <IconSimpleFees className="w-4 h-auto fill-background" />
                                <span>{t('confirmationModal.fees')}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end justify-between">
                            {fees.isLoading ? (
                                <Skeleton className="h-3 w-[60px]" />
                            ) : fees.data.length === 0 ? (
                                <>
                                    <span className="text-xs leading-none">0 fees</span>
                                </>
                            ) : (
                                <>
                                    {feeTokens.map(({ token, tokenTotal }) => (
                                        <div
                                            key={`${token.symbol}-fee`}
                                            className="flex items-center gap-1.5 cursor-pointer"
                                            // onClick={() => feeBreakdownModal.open()}
                                        >
                                            <span className="pt-[2px] text-xs leading-none text-muted-foreground">
                                                {tokenTotal.formatted}
                                            </span>
                                            <OIcon type="TOKEN" iconId={token.symbol} size={4} className="shrink-0" />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter className="pt-0">
                <Button onClick={onNext} className="w-full">
                    {t('buttons.continue')}
                </Button>
            </DialogFooter>
        </>
    );
};
