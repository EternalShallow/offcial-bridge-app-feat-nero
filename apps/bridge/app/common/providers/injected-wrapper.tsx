'use client';

import { InjectedState } from '@/service/models/inject.model';

import { InjectedStoreProvider } from './injected.provider';

export function InjectedWrapper({
    children,
    initialValues,
}: {
    children: React.ReactNode;
    initialValues: InjectedState;
}) {
    return <InjectedStoreProvider initialValues={initialValues}>{children}</InjectedStoreProvider>;
}
