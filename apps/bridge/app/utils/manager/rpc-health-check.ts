/**
 * RPC Health Check Module
 *
 * This module provides comprehensive RPC health checking capabilities to
 * test different RPC endpoints and categorize them into whitelist/blacklist
 * for optimal performance in the RPC Manager.
 *
 * Features:
 * 1. Basic connectivity testing
 * 2. Gas estimation testing with real transaction data
 * 3. Response time measurement
 * 4. Success rate tracking
 * 5. Automatic categorization into whitelist/blacklist
 */
import { isRealRpcFailure } from './rpc-error';
import { rpcManager } from './rpc-manager';

// Health check result interface
export interface RpcHealthResult {
    rpc: string;
    isHealthy: boolean;
    responseTime: number;
    successRate: number;
    lastTested: number;
    errorCount: number;
    successCount: number;
    lastError?: string;
    category: 'whitelist' | 'blacklist' | 'unknown';
}

// Health check configuration
export interface HealthCheckConfig {
    timeout: number;
    maxRetries: number;
    minSuccessRate: number;
    maxResponseTime: number;
    testTransactions: Array<{
        to: string;
        value: string;
        data: string;
        from: string;
    }>;
}

// Default configuration
const DEFAULT_CONFIG: HealthCheckConfig = {
    timeout: 10000, // 10 seconds
    maxRetries: 3,
    minSuccessRate: 0.7, // 70%
    maxResponseTime: 5000, // 5 seconds
    testTransactions: [
        {
            to: '0xc87baaa752642beb24e3b86b624dc8a5115e321b',
            value: '0x0',
            data: '0x095ea7b3000000000000000000000000da9c889a49c55e8fc9479eff4aa12f5a06d0f7140000000000000000000000000000000000000000000000000de0b6b3a7640000',
            from: '0x219360A9aD9069eD9667ad888D61C832e701031F',
        },
    ],
};

// Health check results storage
const healthResults = new Map<string, RpcHealthResult>();

/**
 * Test basic RPC connectivity
 */
async function testBasicConnectivity(
    rpc: string,
    timeout: number,
): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(rpc, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (!response.ok) {
            return {
                success: false,
                responseTime,
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }

        const data = await response.json();

        if (data.error) {
            return {
                success: false,
                responseTime,
                error: data.error.message || 'RPC error',
            };
        }

        return {
            success: true,
            responseTime,
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
            success: false,
            responseTime,
            error: errorMessage,
        };
    }
}

/**
 * Test gas estimation with real transaction data
 */
async function testGasEstimationInternal(
    rpc: string,
    transactions: Array<{ to: string; value: string; data: string; from: string }>,
    timeout: number,
): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let hasValidResponse = false;
        let lastBusinessLogicError = '';

        // Test each transaction
        for (const tx of transactions) {
            const response = await fetch(rpc, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_estimateGas',
                    params: [tx],
                    id: 1,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                clearTimeout(timeoutId);
                return {
                    success: false,
                    responseTime: Date.now() - startTime,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                };
            }

            const data = await response.json();

            if (data.error) {
                const errorMessage = data.error.message || 'RPC error';

                // Check if it's a business logic error (should not fail the RPC)
                if (!isRealRpcFailure(errorMessage)) {
                    // Business logic error is expected for test transactions
                    // This actually indicates the RPC is working correctly
                    hasValidResponse = true;
                    lastBusinessLogicError = errorMessage;
                    console.log(
                        `[HealthCheck] RPC ${rpc} returned business logic error: ${errorMessage} - This is expected and indicates RPC is working`,
                    );
                    continue;
                }

                clearTimeout(timeoutId);
                return {
                    success: false,
                    responseTime: Date.now() - startTime,
                    error: errorMessage,
                };
            } else {
                // No error - RPC returned a valid response
                hasValidResponse = true;
            }
        }

        clearTimeout(timeoutId);

        // If we got at least one valid response (either success or business logic error), RPC is working
        if (hasValidResponse) {
            return {
                success: true,
                responseTime: Date.now() - startTime,
            };
        }

        // If we didn't get any valid responses, something is wrong
        return {
            success: false,
            responseTime: Date.now() - startTime,
            error: lastBusinessLogicError || 'No valid responses from RPC',
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
            success: false,
            responseTime,
            error: errorMessage,
        };
    }
}

/**
 * Perform comprehensive health check on a single RPC
 */
async function performHealthCheck(rpc: string, config: HealthCheckConfig): Promise<RpcHealthResult> {
    console.log(`[HealthCheck] Testing RPC: ${rpc}`);

    const existingResult = healthResults.get(rpc);
    const currentTime = Date.now();

    // Initialize or update result
    const result: RpcHealthResult = {
        rpc,
        isHealthy: false,
        responseTime: 0,
        successRate: 0,
        lastTested: currentTime,
        errorCount: existingResult?.errorCount || 0,
        successCount: existingResult?.successCount || 0,
        category: 'unknown',
    };

    // Test 1: Basic connectivity
    const connectivityTest = await testBasicConnectivity(rpc, config.timeout);

    if (!connectivityTest.success) {
        result.errorCount++;
        result.lastError = connectivityTest.error;
        result.responseTime = connectivityTest.responseTime;
        result.category = 'blacklist';

        healthResults.set(rpc, result);
        console.log(`[HealthCheck] RPC ${rpc} failed connectivity test: ${connectivityTest.error}`);
        return result;
    }

    // Test 2: Gas estimation
    const gasTest = await testGasEstimationInternal(rpc, config.testTransactions, config.timeout);

    if (!gasTest.success) {
        result.errorCount++;
        result.lastError = gasTest.error;
        result.responseTime = Math.max(connectivityTest.responseTime, gasTest.responseTime);
        result.category = 'blacklist';

        healthResults.set(rpc, result);
        console.log(`[HealthCheck] RPC ${rpc} failed gas estimation test: ${gasTest.error}`);
        return result;
    }

    // Success
    result.successCount++;
    result.responseTime = Math.max(connectivityTest.responseTime, gasTest.responseTime);
    result.isHealthy = true;

    // Calculate success rate
    const totalTests = result.successCount + result.errorCount;
    result.successRate = totalTests > 0 ? result.successCount / totalTests : 0;

    // Categorize based on performance
    if (result.successRate >= config.minSuccessRate && result.responseTime <= config.maxResponseTime) {
        result.category = 'whitelist';
    } else {
        result.category = 'blacklist';
    }

    healthResults.set(rpc, result);
    console.log(
        `[HealthCheck] RPC ${rpc} passed health check - Category: ${result.category}, Success Rate: ${(result.successRate * 100).toFixed(1)}%, Response Time: ${result.responseTime}ms`,
    );

    return result;
}

/**
 * Perform health check on multiple RPCs in parallel
 */
export async function healthCheckRpcs(
    rpcs: string[],
    config: Partial<HealthCheckConfig> = {},
): Promise<Map<string, RpcHealthResult>> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    console.log(`[HealthCheck] Starting health check for ${rpcs.length} RPCs`);

    // Perform health checks in parallel (max 5 at a time to avoid overwhelming)
    const batchSize = 5;
    const results = new Map<string, RpcHealthResult>();

    for (let i = 0; i < rpcs.length; i += batchSize) {
        const batch = rpcs.slice(i, i + batchSize);
        const batchPromises = batch.map((rpc) => performHealthCheck(rpc, finalConfig));

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
            const rpc = batch[index];
            if (result.status === 'fulfilled') {
                results.set(rpc, result.value);
            } else {
                console.error(`[HealthCheck] Failed to test RPC ${rpc}:`, result.reason);
                // Mark as failed
                const failedResult: RpcHealthResult = {
                    rpc,
                    isHealthy: false,
                    responseTime: 0,
                    successRate: 0,
                    lastTested: Date.now(),
                    errorCount: 1,
                    successCount: 0,
                    lastError: result.reason?.message || 'Unknown error',
                    category: 'blacklist',
                };
                results.set(rpc, failedResult);
                healthResults.set(rpc, failedResult);
            }
        });

        // Small delay between batches
        if (i + batchSize < rpcs.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    // Update RPC manager with results
    updateRpcManagerWithResults(results);

    console.log(`[HealthCheck] Health check completed. Results:`, {
        total: results.size,
        whitelist: Array.from(results.values()).filter((r) => r.category === 'whitelist').length,
        blacklist: Array.from(results.values()).filter((r) => r.category === 'blacklist').length,
    });

    return results;
}

/**
 * Update RPC manager with health check results
 */
function updateRpcManagerWithResults(results: Map<string, RpcHealthResult>) {
    results.forEach((result, rpc) => {
        if (result.category === 'whitelist') {
            // Mark as available in RPC manager
            rpcManager.markRpcAvailable(rpc);
        } else if (result.category === 'blacklist') {
            // Mark as failed in RPC manager
            rpcManager.markRpcFailed(rpc);
        }
    });
}

/**
 * Get health check results for all tested RPCs
 */
export function getHealthCheckResults(): Map<string, RpcHealthResult> {
    return new Map(healthResults);
}

/**
 * Get whitelist RPCs based on health check results
 */
export function getWhitelistRpcs(): string[] {
    return Array.from(healthResults.values())
        .filter((result) => result.category === 'whitelist')
        .map((result) => result.rpc);
}

/**
 * Get blacklist RPCs based on health check results
 */
export function getBlacklistRpcs(): string[] {
    return Array.from(healthResults.values())
        .filter((result) => result.category === 'blacklist')
        .map((result) => result.rpc);
}

/**
 * Clear all health check results
 */
export function clearHealthCheckResults(): void {
    healthResults.clear();
    console.log('[HealthCheck] All health check results cleared');
}

/**
 * Test gas estimation with specific transaction data
 */
export async function testGasEstimation(
    rpcs: string[],
    transactions: Array<{ to: string; value: string; data: string; from: string }>,
    testName: string = 'Gas Estimation Test',
): Promise<void> {
    console.log(`[${testName}] Starting gas estimation test with ${rpcs.length} RPCs`);

    const config: HealthCheckConfig = {
        ...DEFAULT_CONFIG,
        testTransactions: transactions,
    };

    const results = await healthCheckRpcs(rpcs, config);

    console.log(`[${testName}] Test completed. Summary:`, {
        total: results.size,
        whitelist: getWhitelistRpcs().length,
        blacklist: getBlacklistRpcs().length,
        whitelistRpcs: getWhitelistRpcs(),
        blacklistRpcs: getBlacklistRpcs(),
    });
}
