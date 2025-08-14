import React from 'react';

import { Search } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog2';
import { Skeleton } from '@/components/ui/skeleton';

export interface BaseSelectItem {
    id: string | number;
}

interface CommonSelectModalProps<T extends BaseSelectItem> {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    onSelectItem: (item: T) => void;
    searchPlaceholder: string;
    popularItems?: T[];
    renderPopularItem?: (item: T, onSelectItem: (item: T) => void) => React.ReactNode;
    isLoading?: boolean;
    keyword?: string;
    onKeywordChange?: (keyword: string) => void;
    onPopularClick?: (item: T) => void;
}

export const CommonSelectModal = <T extends BaseSelectItem>({
    isOpen,
    onClose,
    title,
    items,
    renderItem,
    onSelectItem,
    searchPlaceholder,
    popularItems,
    renderPopularItem,
    isLoading,
    keyword,
    onKeywordChange,
}: CommonSelectModalProps<T>) => {
    const handleSelect = (item: T) => {
        onSelectItem(item);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 sm:max-w-sm bg-bg1">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={keyword}
                            onChange={(e) => onKeywordChange?.(e.target.value)}
                            className="w-full rounded-lg border-transparent bg-bg2 py-2.5 pl-10 pr-4 text-base text-t1 placeholder-t3 transition-colors focus:border-blue-500 focus:outline-none focus:ring-0"
                        />
                    </div>
                </div>

                {popularItems && renderPopularItem && popularItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-6 py-2">
                        {popularItems.map((item) => (
                            <React.Fragment key={item.id}>{renderPopularItem(item, handleSelect)}</React.Fragment>
                        ))}
                    </div>
                )}

                <div className="flex h-[45vh] flex-col overflow-y-auto mt-2 pb-6 border-t border-bg2">
                    <div className="flex flex-col gap-0.5">
                        {isLoading &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex h-[72px] items-center gap-4 px-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            ))}
                        {!isLoading &&
                            items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className="cursor-pointer px-4 py-3 transition-colors hover:bg-bg2"
                                >
                                    {renderItem(item)}
                                </div>
                            ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
