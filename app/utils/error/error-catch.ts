/**
 * Check if error is insufficient gas error
 * @param error - Error object to check
 * @returns True if it's insufficient gas error
 */
export function isInsufficientGasError(error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return errMsg.includes('insufficient funds');
}
