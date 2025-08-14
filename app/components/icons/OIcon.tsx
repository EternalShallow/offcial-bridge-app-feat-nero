import { HTMLAttributes, useEffect, useState } from 'react';

import Image from 'next/image';

import { cn } from '@/common/lib/utils';

import { Skeleton } from '../ui/skeleton';
import { DefaultIcon } from './index';

const path = {
    CHAIN: '/icon/chain/',
    CHAIN_COVER: '/icon/chain/cover/',
    TOKEN: '/icon/token/',
    BRIDGE_TOKEN: '/icon/b-token/',
};

export type IconType = 'CHAIN' | 'TOKEN' | 'BRIDGE_TOKEN' | 'CHAIN_COVER' | 'CUSTOM';

type BaseProps = HTMLAttributes<HTMLImageElement> & { size?: number; className?: string; containerClassName?: string };

type ChainTokenProps = {
    type: 'CHAIN' | 'TOKEN' | 'BRIDGE_TOKEN' | 'CHAIN_COVER';
    iconId?: string;
    src?: string;
};
type CustomProps = {
    type: 'CUSTOM';
    src: string;
    iconId?: string;
};

type OIconType = (ChainTokenProps | CustomProps) & BaseProps;

export function OIcon({ type, iconId, className, src, size = 6, containerClassName, ...rest }: OIconType) {
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const imageUrl = src ?? `https://cdn.orbiter.finance${path[type as keyof typeof path]}${iconId}.svg`;

    useEffect(() => {
        setError(false);
        setIsLoading(true);
    }, [iconId, imageUrl]);

    const handleError = () => {
        setError(true);
        setIsLoading(false);
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const renderSkeleton = (
        <Skeleton
            className={cn('rounded-full absolute top-0 left-0', className)}
            style={{ width: size * 4, height: size * 4 }}
        />
    );

    if (!iconId) {
        return renderSkeleton;
    }

    return (
        <div className={cn('relative', containerClassName)}>
            {isLoading && renderSkeleton}
            {error ? (
                <DefaultIcon size={size * 4} className={className} />
            ) : (
                <Image
                    src={imageUrl}
                    alt={iconId}
                    width={size * 4}
                    height={size * 4}
                    className={cn('rounded-full', className)}
                    loading="lazy"
                    onError={handleError}
                    onLoad={handleLoad}
                    {...(rest as any)}
                />
            )}
        </div>
    );
}
