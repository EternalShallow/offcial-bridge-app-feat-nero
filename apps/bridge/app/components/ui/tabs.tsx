'use client';

import * as React from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/common/lib/utils';

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            className={cn(
                'text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-full bg-gray-100 ',
                className
            )}
            {...props}
        />
    );
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
    variant?: 'default' | 'brand' | 'danger' | 'ghost' | 'gray' | 'step';
};

function TabsTrigger({ className, variant = 'default', ...props }: TabsTriggerProps) {
    const variantClass = {
        default: 'data-[state=active]:bg-gray-100 data-[state=active]:text-foreground rounded-full',
        brand: 'data-[state=active]:bg-brand-500 data-[state=active]:text-t1 text-brand-500',
        danger: 'data-[state=active]:bg-red-500 data-[state=active]:text-t1 text-red-500',
        ghost: 'bg-transparent data-[state=active]:bg-gray-100 data-[state=active]:text-foreground',
        gray: 'data-[state=active]:bg-gray-700 data-[state=active]:text-t1 text-gray-500',
        step: 'data-[state=active]:!bg-foreground bg-gray-100 data-[state=active]:text-background rounded-full',
    }[variant];

    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-4 py-2 leading-1.5 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                'cursor-pointer',
                variantClass,
                className
            )}
            {...props}
        />
    );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content data-slot="tabs-content" className={cn('flex-1 outline-none', className)} {...props} />
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
