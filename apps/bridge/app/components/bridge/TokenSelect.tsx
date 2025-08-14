import { ChevronDownIcon } from 'lucide-react';

import { useModal } from '@/hooks/use-modal';
import { TokenType } from '@/service/models/token.model';
import { useSelectedToken } from '@/service/stores/token.store';

import { OIcon } from '../icons/OIcon';
import { Button } from '../ui/button';

export const TokenSelect = () => {
    const token = useSelectedToken();

    const { open } = useModal('TokenSelect');
    // console.log('[TokenSelect] token', token);

    return (
        <Button
            className="flex items-center gap-1 h-[36px] p-[6px] text-base rounded-full bg-gray-50 hover:bg-gray-200 transition-colors duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer"
            onClick={() => {
                open('from');
            }}
        >
            {token?.tokenType === TokenType.BRIDGED ? (
                <OIcon type="BRIDGE_TOKEN" iconId={token?.symbol} className="flex-shrink-0" size={6} />
            ) : (
                <OIcon type="TOKEN" iconId={token?.symbol} className="flex-shrink-0" size={6} />
            )}
            <span className="text-t1 text-base font-medium tracking-wider">{token?.symbol}</span>
            <ChevronDownIcon className="w-5 h-5 flex-shrink-0 text-t1" />
        </Button>
    );
};

// rounded-full
// p-1.5
// h-[36px]
// text-base
// bg-gray-50
// hover:bg-gray-200
// transition-colors
// duration-200
// whitespace-nowrap
// flex-shrink-0
// cursor-pointer
