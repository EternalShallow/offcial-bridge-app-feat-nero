export type RouteProvider = (typeof RouteProvider)[keyof typeof RouteProvider];

export const RouteProvider = {
    EniDeposit: 'EniDeposit',
    EniWithdrawal: 'EniWithdrawal',
    EniForcedWithdrawal: 'EniForcedWithdrawal',
    EniInterop: 'EniInterop',
    NERODeposit: 'NERODeposit',
    NEROWithdrawal: 'NEROWithdrawal',
    NEROForcedWithdrawal: 'NEROForcedWithdrawal',
    NEROInterop: 'NEROInterop',
    Orbiter: 'Orbiter',
    // OptimismDeposit: 'OptimismDeposit',
    // OptimismWithdrawal: 'OptimismWithdrawal',
    // OptimismForcedWithdrawal: 'OptimismForcedWithdrawal',
    // OptimismInterop: 'OptimismInterop',
    // ArbitrumDeposit: 'ArbitrumDeposit',
    // ArbitrumWithdrawal: 'ArbitrumWithdrawal',
    // Signet: 'Signet',
    // Cctp: 'Cctp',
    // Across: 'Across',
    // Hyperlane: 'Hyperlane',
    // Lz: 'Lz',
    // Stargate: 'Stargate',
    // Ccip: 'Ccip',
    // Eco: 'Eco',
    // Relay: 'Relay',
} as const;

export const providerNames = {
    [RouteProvider.EniDeposit]: 'Native Bridge',
    [RouteProvider.EniWithdrawal]: 'Native Bridge',
    [RouteProvider.EniForcedWithdrawal]: 'Native Bridge',
    [RouteProvider.EniInterop]: 'Native Bridge',
    [RouteProvider.NERODeposit]: 'Native Bridge',
    [RouteProvider.NEROWithdrawal]: 'Native Bridge',
    [RouteProvider.NEROInterop]: 'Native Bridge',
    [RouteProvider.NEROForcedWithdrawal]: 'Native Bridge',
    [RouteProvider.Orbiter]: 'Orbiter Finance',
};

export const useProviderName = (provider?: RouteProvider) => {
    if (!provider) return '';

    // console.log('【provider】', provider);
    return providerNames[provider];
};

export const nativeRoutes: RouteProvider[] = [
    RouteProvider.EniDeposit,
    RouteProvider.EniWithdrawal,
    RouteProvider.EniForcedWithdrawal,
    RouteProvider.EniInterop,
    RouteProvider.NERODeposit,
    RouteProvider.NEROWithdrawal,
    RouteProvider.NEROForcedWithdrawal,
    RouteProvider.NEROInterop,
];

export const depositRoutes: RouteProvider[] = [RouteProvider.EniDeposit, RouteProvider.NERODeposit];

export const withdrawalRoutes: RouteProvider[] = [
    RouteProvider.EniWithdrawal,
    RouteProvider.EniForcedWithdrawal,
    RouteProvider.NEROWithdrawal,
    RouteProvider.NEROForcedWithdrawal,
];
