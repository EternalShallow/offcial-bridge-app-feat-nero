import { ChevronDownIcon, ClockIcon } from 'lucide-react';

import { RouteProvider, useProviderName } from '@/common/consts/route-provider';
import { useToChainId } from '@/hooks/use-chains';
import { useTransformPeriodText } from '@/hooks/use-transform-period-text';
import { RouteQuoteDto } from '@/service/models/route.model';
import { getPeriod } from '@/utils/get-period';

import { BridgeAmount } from '../bridge/BridgeAmount';
import { BridgeFees } from '../bridge/BridgeFees';
import { OIcon } from '../icons/OIcon';

export const RouteDetail = ({
    provider,
    quote,
    allowDetailClicks,
    onRoutesClick,
}: {
    provider: RouteProvider;
    quote: RouteQuoteDto;
    allowDetailClicks?: boolean;
    onRoutesClick?: () => void;
}) => {
    const toChainId = useToChainId();
    const transformPeriod = useTransformPeriodText();
    const time = transformPeriod('transferTime', {}, getPeriod(quote.duration / 1000));

    const providerName = useProviderName(provider);

    const renderProvider = () => {
        return (
            <div
                className="flex items-center gap-2 rounded-full p-1.5 text-base
                bg-gray-50 hover:bg-gray-200
                transition-colors duration-200 cursor-pointer"
            >
                <OIcon type="CHAIN" iconId={toChainId?.toString()} className="rounded-md" size={6} />
                <span className="text-t1 text-base font-medium tracking-wider">{providerName}</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between p-2.5 border-b border-gray-100">
                {allowDetailClicks && onRoutesClick ? (
                    <button onClick={onRoutesClick} className="flex items-center gap-2">
                        {renderProvider()}
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                ) : (
                    renderProvider()
                )}
                <div className="flex gap-1 items-center ml-auto bg-muted pl-2.5 pr-1.5 py-1.5 rounded-full">
                    <span className="text-xs text-right leading-none text-foreground">{time}</span>
                    <ClockIcon className="h-4 w-4 fill-muted-foreground" />{' '}
                </div>
            </div>
            <div className="flex flex-col px-4 py-5">
                <BridgeAmount />
                <BridgeFees provider={provider} quote={quote} />
            </div>
        </div>
    );
};
