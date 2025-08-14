import { useMemo, useState } from 'react';

import { useSetAtom } from 'jotai';

import { OIcon } from '@/components/icons/OIcon';
import { Pill } from '@/components/ui/pill';
import { useChains } from '@/hooks/use-chains';
import { useModal } from '@/hooks/use-modal';
import { ChainDto } from '@/service/models/chain.model';
import { fromChainIdAtom, toChainIdAtom } from '@/service/stores/bridge.store';

import { BaseSelectItem, CommonSelectModal } from './CommonSelectModal';

const popularChainIds = ['1', '42161', '10', '8453', '324'];

interface ChainSelectItem extends ChainDto, BaseSelectItem {}

export const ChainSelectModal = () => {
    const { isOpen, close, data } = useModal('ChainSelect');
    const type = data as 'from' | 'to' | undefined;

    const setFromChainId = useSetAtom(fromChainIdAtom);
    const setToChainId = useSetAtom(toChainIdAtom);

    const [keyword, setKeyword] = useState('');
    const chains = useChains();

    const { popularChains, filteredChains } = useMemo(() => {
        const lowerCaseKeyword = keyword.toLowerCase();
        const all = (chains || []).map((c) => ({ ...c, id: c.chainId })) as ChainSelectItem[];

        const filtered = all.filter(
            (chain) =>
                chain.name.toLowerCase().includes(lowerCaseKeyword) ||
                chain.chainId.toString().toLowerCase().includes(lowerCaseKeyword)
        );
        const popular = all.filter((chain) => popularChainIds.includes(chain.chainId));

        return { popularChains: popular, filteredChains: filtered };
    }, [chains, keyword]);

    const handleSelectChain = (chain: ChainSelectItem) => {
        if (type === 'from') {
            setFromChainId(Number(chain.chainId));
        } else if (type === 'to') {
            setToChainId(Number(chain.chainId));
        }
    };

    const renderItem = (item: ChainSelectItem) => (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <OIcon type="CHAIN" iconId={item.chainId} size={10} />
                <div className="flex flex-col">
                    <span className="text-base font-bold text-t1">{item.name}</span>
                </div>
            </div>
        </div>
    );

    const renderPopularItem = (item: ChainSelectItem, onSelect: (item: ChainSelectItem) => void) => (
        <button
            key={item.chainId}
            onClick={() => onSelect(item)}
            className="rounded-full hover:opacity-80 transition-opacity"
        >
            <Pill>
                <OIcon type="CHAIN" iconId={item.chainId} size={4} />
                <span className="ml-1.5 text-sm">{item.name}</span>
            </Pill>
        </button>
    );

    return (
        <CommonSelectModal<ChainSelectItem>
            isOpen={isOpen}
            onClose={close}
            title="Select a Chain"
            items={filteredChains}
            renderItem={renderItem}
            onSelectItem={handleSelectChain}
            searchPlaceholder="Search Network"
            popularItems={popularChains}
            renderPopularItem={renderPopularItem}
            keyword={keyword}
            onKeywordChange={setKeyword}
        />
    );
};
