import { toHex } from 'viem';

/**
 * Format the value of a transaction to a hex string
 * @param value - The value to format (string, number, or bigint)
 * @returns A hex string representation of the value
 * @throws Error if the input is invalid or cannot be converted
 */
export const formatTxValue = (value: string | number | bigint): string => {
    // Handle zero values first
    if (value === '0' || value === 0 || value === 0n) {
        return '0x0';
    }

    // Input validation
    if (value === null || value === undefined) {
        throw new Error('Value cannot be null or undefined');
    }

    if (typeof value === 'string') {
        // Validate string input
        if (value.trim() === '') {
            throw new Error('Value cannot be an empty string');
        }

        // Check for valid numeric string
        if (!/^\d+$/.test(value)) {
            throw new Error('String value must contain only digits');
        }

        // Check for negative values
        if (value.startsWith('-')) {
            throw new Error('Value cannot be negative');
        }

        // Check for leading zeros (except for single zero)
        if (value.length > 1 && value.startsWith('0')) {
            throw new Error('Value cannot have leading zeros');
        }
    } else if (typeof value === 'number') {
        // Validate number input
        if (!Number.isInteger(value)) {
            throw new Error('Number value must be an integer');
        }

        if (value < 0) {
            throw new Error('Value cannot be negative');
        }

        if (!Number.isSafeInteger(value)) {
            throw new Error('Number value exceeds safe integer range');
        }
    } else if (typeof value === 'bigint') {
        // Validate bigint input
        if (value < 0n) {
            throw new Error('Value cannot be negative');
        }
    } else {
        throw new Error(`Invalid value type: ${typeof value}. Expected string, number, or bigint`);
    }

    try {
        return toHex(value);
    } catch (error) {
        // Provide more specific error messages
        if (error instanceof Error) {
            throw new Error(`Failed to convert value to hex: ${error.message}`);
        }
        throw new Error('Failed to convert value to hex');
    }
};

/**
 * Safe version of formatTxValue that returns a default value instead of throwing
 * @param value - The value to format
 * @param defaultValue - The default value to return if conversion fails (default: '0x0')
 * @returns A hex string representation of the value or the default value
 */
export const formatTxValueSafe = (value: string | number | bigint, defaultValue: string = '0x0'): string => {
    try {
        return formatTxValue(value);
    } catch (error) {
        console.warn('Format Tx Value failed:', error);
        return defaultValue;
    }
};
