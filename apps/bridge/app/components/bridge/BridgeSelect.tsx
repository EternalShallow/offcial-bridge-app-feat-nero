import { useChain } from '@/hooks/use-chains';

import { OIcon } from '../icons/OIcon';
import { Label } from '../ui/label';

interface BridgeSelectProps {
    title: string;
    chainId?: number;
    onChange?: (chainId: number) => void;
}

// TODO: add chain select modal

export const BridgeSelect = ({ title, chainId }: BridgeSelectProps) => {
    const chain = useChain(chainId);

    return (
        <div className="flex items-center justify-between bg-gray-200 rounded-lg p-4">
            <Label className="text-base text-foreground">{title}</Label>
            <div className="flex items-center gap-2">
                <span className="text-base text-foreground font-bold">{chain?.name}</span>
                <OIcon type="CHAIN" iconId={chainId?.toString()} className="rounded-md" size={6} />
            </div>
        </div>
    );
};
