import clsx from 'clsx';

import { useNetworkFeeForGasLimit } from '@/hooks/fees/use-network-fee';
import { ChainDto } from '@/service/models/chain.model';

import { IconSimpleGas } from '../icons';
import { OIcon } from '../icons/OIcon';
import { Skeleton } from '../ui/skeleton';

export const Pill = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div
            className={clsx(
                'shrink-0 flex items-center bg-muted text-xs text-muted-foreground py-1.5 px-2.5 h-7 rounded-full gap-1 leading-none',
                className
            )}
        >
            {children}
        </div>
    );
};

export const SmallPill = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div
            className={clsx(
                'shrink-0 flex items-center bg-muted text-xs text-muted-foreground p-[1px] pr-2 rounded-full gap-1 border border-bg2 leading-none',
                className
            )}
        >
            {children}
        </div>
    );
};

export const GasFeePill = ({
    networkFee,
    chain,
    showChainIcon,
    txStepCount,
}: {
    chain: ChainDto | undefined;
    networkFee: ReturnType<typeof useNetworkFeeForGasLimit>;
    showChainIcon?: boolean;
    txStepCount?: number;
}) => {
    return (
        <div className={clsx('shrink-0 flex gap-1 items-center bg-muted px-2.5 py-1 h-7 rounded-full')}>
            <div className="flex items-center">
                {showChainIcon && <OIcon type="CHAIN" iconId={chain?.chainId.toString()} size={4} />}
                <IconSimpleGas className="h-3.5 w-3.5 relative z-10 fill-muted-foreground group-hover:fill-foreground" />
            </div>
            {networkFee.data?.fiat?.formatted ? (
                <span className="text-xs leading-none text-muted-foreground group-hover:text-foreground">
                    {networkFee.data?.fiat?.formatted}
                </span>
            ) : networkFee.data?.token.formatted ? (
                <span className="text-xs leading-none text-muted-foreground group-hover:text-foreground">
                    {networkFee.data?.token.formatted}
                </span>
            ) : (
                <Skeleton className="h-3 w-[60px] bg-muted-foreground" />
            )}
            {!!txStepCount && txStepCount > 1 && (
                <span className="rounded-full text-[9px] leading-none bg-primary-gradient text-primary-foreground py-1 px-1.5 -mr-1">
                    {txStepCount} × txns
                </span>
            )}
        </div>
    );
};
