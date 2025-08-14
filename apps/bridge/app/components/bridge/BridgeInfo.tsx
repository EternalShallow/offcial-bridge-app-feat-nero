import { memo, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { RouteProvider } from '@/common/consts/route-provider';
import { IconArrowDownRightCircle, IconArrowUpRightCircle, IconTime, IconVia } from '@/components/icons';
import { OIcon } from '@/components/icons/OIcon';
import { useExplorerLink } from '@/hooks/links/use-explorer-link';
import { useAddressProfile } from '@/hooks/profiles/use-address-profile';
import { ChainDto } from '@/service/models/chain.model';
import { Token } from '@/service/models/token.model';

import { RouteProviderIcon, RouteProviderName } from '../icons/route-provider-icon';

export const useAddressMeta = (chain: ChainDto | null, address: string | null | undefined) => {
    const profile = useAddressProfile(chain, address);
    const link = useExplorerLink('address', address || '', chain)?.link;

    return useMemo(() => {
        if (!address || !chain) {
            return null;
        }

        return {
            formatted: profile.data?.name ?? address?.slice(0, 4) + '...' + address?.slice(address.length - 4),
            link,
        };
    }, [address, chain, profile.data?.name, link]);
};

export interface BridgeInfoProps {
    from: ChainDto | null;
    to: ChainDto | null;
    sender?: string;
    recipient?: string;
    token?: Token;
    sentAmount?: string;
    receivedAmount?: string;
    provider?: RouteProvider;
    transferTime?: string;
}

export const BridgeInfo = memo(
    ({ from, to, sender, recipient, token, sentAmount, receivedAmount, provider, transferTime }: BridgeInfoProps) => {
        const { t } = useTranslation();
        const fromMeta = useAddressMeta(from, sender);
        const toMeta = useAddressMeta(to, recipient);

        if (!from || !to || !token) {
            return null;
        }

        return (
            <div className="flex flex-col gap-2 bg-bg1 border border-bg2 rounded-2xl">
                <div className="flex flex-col divide-y divide-border py-0.5 text-xs">
                    {/* Send */}
                    <div className="flex items-start gap-4 py-4 px-3.5 justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <OIcon type="CHAIN" iconId={from?.chainId} className="h-5 w-5 rounded-md" />
                                <span>{t('transaction.fromChain', { from: from?.name })}</span>
                            </div>
                        </div>
                        <div className="flex gap-1.5 items-center justify-between ">
                            {sentAmount} {token?.symbol}
                            <OIcon type="TOKEN" iconId={token?.symbol} className="h-5 w-5 !text-[8px]" />
                        </div>
                    </div>

                    {/* Receive */}
                    <div className="flex items-start gap-4 py-4 px-3.5 justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <OIcon type="CHAIN" iconId={to?.chainId} className="h-5 w-5 rounded-md" />
                                <span>{t('transaction.toChain', { to: to?.name })}</span>
                            </div>
                        </div>
                        <div className="flex gap-1.5 items-center justify-between ">
                            {receivedAmount} {token?.symbol}
                            <OIcon type="TOKEN" iconId={token?.symbol} className="h-5 w-5 !text-[8px]" />
                        </div>
                    </div>

                    {/* Via */}
                    <div className="flex items-start gap-4 py-4 px-3.5 justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconVia className="w-4 h-auto" />
                                <span>{t('transaction.via')}</span>
                            </div>
                        </div>
                        <div className="flex gap-1.5 items-center justify-between ">
                            <RouteProviderName provider={provider} />
                            <RouteProviderIcon provider={provider} className="h-5 w-5 rounded-md" />
                        </div>
                    </div>

                    {/* Sender */}
                    <div className="flex items-start gap-4 py-4 px-3.5 justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconArrowDownRightCircle className="w-4 h-auto fill-background" />
                                <span>{t('transaction.fromAddress')}</span>
                            </div>
                        </div>
                        <a target="_blank" href={fromMeta?.link ?? ''}>
                            {fromMeta?.formatted}
                        </a>
                    </div>

                    {/* Recipient */}
                    <div className="flex items-start gap-4 py-4 px-3.5 justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconArrowUpRightCircle className="w-4 h-auto fill-background" />
                                <span>{t('transaction.toAddress')}</span>
                            </div>
                        </div>
                        <a target="_blank" href={toMeta?.link ?? ''}>
                            {toMeta?.formatted}
                        </a>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-start gap-4 py-4 px-3.5 justify-between">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconTime className="w-4 h-auto" />
                                <span>{t('transaction.transferTime')}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>{transferTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

BridgeInfo.displayName = 'BridgeInfo';
