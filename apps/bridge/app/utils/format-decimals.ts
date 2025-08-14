export const formatDecimals = (x: number | undefined | null) => {
    if (typeof x === 'undefined' || x === null) {
        return '';
    }

    let maximumFractionDigits = 0;
    if (x > 1) {
        maximumFractionDigits = 4;
    } else {
        const leadingZeroDecimals = Math.floor(Math.abs(Math.log10(x)));
        if (leadingZeroDecimals === Infinity) {
            maximumFractionDigits = 0;
        } else {
            maximumFractionDigits = leadingZeroDecimals + 4;
        }
    }

    if (maximumFractionDigits > 20) {
        maximumFractionDigits = 10;
    }

    if (isNaN(maximumFractionDigits)) {
        maximumFractionDigits = 2;
    }

    const factor = Math.pow(10, maximumFractionDigits);
    const floored = Math.floor(x * factor) / factor;

    return floored.toLocaleString('en-US', {
        maximumFractionDigits,
        minimumFractionDigits: 0,
    });
};

export const formatToCurrency = (value: number | string | undefined, currency = 'USD') => {
    if (value === undefined || value === null) {
        return '$0.00';
    }
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
        return '$0.00';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};
