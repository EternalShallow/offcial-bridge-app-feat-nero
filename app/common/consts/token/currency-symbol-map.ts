export const currencySymbolMap: {
    [symbol: string]: { symbol: string; subunit?: string; flag: string };
} = {
    AUD: { symbol: '$', subunit: '¢', flag: '🇦🇺' },
    BRL: { symbol: 'R$', subunit: 'centavo', flag: '🇧🇷' },
    CAD: { symbol: '$', subunit: '¢', flag: '🇨🇦' },
    CHF: { symbol: 'CHF', subunit: 'Rp.', flag: '🇨🇭' },
    EUR: { symbol: '€', subunit: 'c', flag: '🇪🇺' },
    GBP: { symbol: '£', subunit: 'p', flag: '🇬🇧' },
    HKD: { symbol: '$', subunit: '¢', flag: '🇭🇰' },
    JPY: { symbol: '¥', flag: '🇯🇵' }, // no subunit
    NZD: { symbol: '$', subunit: '¢', flag: '🇳🇿' },
    USD: { symbol: '$', subunit: '¢', flag: '🇺🇸' },
};
