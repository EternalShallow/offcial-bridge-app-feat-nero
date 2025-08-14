import Image from 'next/image';

import { RouteProvider, useProviderName } from '@/common/consts/route-provider';
import { TransactionType } from '@/service/models/transaction.model';

const icons = {
    [RouteProvider.EniDeposit]: '/img/networks/eni.jpg',
    [RouteProvider.EniWithdrawal]: '/img/networks/eni.jpg',
    [RouteProvider.EniForcedWithdrawal]: '/img/networks/eni.jpg',
    [RouteProvider.EniInterop]: '/img/networks/eni.jpg',
    [RouteProvider.NERODeposit]: '/img/networks/nero.jpg',
    [RouteProvider.NEROWithdrawal]: '/img/networks/nero.jpg',
    [RouteProvider.NEROForcedWithdrawal]: '/img/networks/nero.jpg',
    [RouteProvider.NEROInterop]: '/img/networks/nero.jpg',
    [RouteProvider.Orbiter]: '/img/obt/orbiter.svg',
};

export const routeProviderToTransactionType = {
    [RouteProvider.EniDeposit]: TransactionType.Deposit,
    [RouteProvider.EniWithdrawal]: TransactionType.Withdrawal,
    [RouteProvider.EniForcedWithdrawal]: TransactionType.ForcedWithdrawal,
    [RouteProvider.EniInterop]: TransactionType.Interop,
    [RouteProvider.NERODeposit]: TransactionType.Deposit,
    [RouteProvider.NEROWithdrawal]: TransactionType.Withdrawal,
    [RouteProvider.NEROForcedWithdrawal]: TransactionType.ForcedWithdrawal,
    [RouteProvider.NEROInterop]: TransactionType.Interop,
    [RouteProvider.Orbiter]: TransactionType.Orbiter,
};

export const RouteProviderName = ({ provider, className }: { provider?: RouteProvider; className?: string }) => {
    const name = useProviderName(provider);

    return <span className={className}>{name}</span>;
};

export const RouteProviderIcon = ({ provider, className }: { provider?: RouteProvider; className?: string }) => {
    if (!provider) {
        return null;
    }

    const icon = icons[provider];

    return <Image alt={`${provider} icon`} src={icon} className={className} height={16} width={16} />;
};
