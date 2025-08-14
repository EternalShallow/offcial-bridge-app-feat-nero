/**
 * RPC Manager
 *
 * This module provides an intelligent RPC management system for optimizing
 * blockchain RPC request performance and reliability.
 *
 * Key Features:
 * 1. Parallel Request Processing - Different RPC requests are executed in parallel
 * 2. Dynamic Whitelist Management - Automatically mark successful/failed RPCs and sort by success rate
 * 3. Intelligent Error Handling - Distinguishes between real RPC failures and business logic failures
 * 4. Failover - Automatically skip failed RPCs and prioritize reliable ones
 * 5. Performance Monitoring - Provide detailed statistics and debugging capabilities
 *
 * Error Handling:
 * - Real RPC failures (timeout, connection issues) will mark RPC as failed
 * - Business logic failures (execution reverted, insufficient funds) won't mark RPC as failed
 * - This prevents good RPCs from being blacklisted due to transaction-specific issues
 *
 * Usage Example:
 * ```typescript
 * import { rpcManager, getRpcManagerStatus, resetAllRpcFailures } from '@/utils/rpc-manager';
 *
 * // Check status
 * const status = getRpcManagerStatus();
 * console.log('Available RPCs:', status.available);
 *
 * // Reset all failures if needed
 * resetAllRpcFailures();
 *
 * // Automatically used in gas.api.ts
 * const gasLimit = await getNetworkGasLimit(rpcs, params);
 * ```
 */
import { logNet } from '../log';
import { isRealRpcFailure } from './rpc-error';

// RPC Manager Class
export class RpcManager {
    // Class properties - RPC state management
    private availableRpcs: Map<string, number> = new Map(); // RPC -> success count
    private failedRpcs: Set<string> = new Set(); // failed RPCs
    private activeRequests: Set<string> = new Set(); // track active request IDs
    private maxParallel: number; // Maximum parallel RPC requests

    constructor(maxParallel: number = 3) {
        this.maxParallel = maxParallel;
    }

    // ===== RPC State Management =====

    markRpcAvailable(rpc: string) {
        this.failedRpcs.delete(rpc);
        const currentCount = this.availableRpcs.get(rpc) || 0;
        this.availableRpcs.set(rpc, currentCount + 1);
    }

    markRpcFailed(rpc: string) {
        this.failedRpcs.add(rpc);
        this.availableRpcs.delete(rpc);
    }

    getAvailableRpcs(allRpcs: string[]): string[] {
        const available = allRpcs.filter((rpc) => !this.failedRpcs.has(rpc));
        return available.sort((a, b) => {
            const aCount = this.availableRpcs.get(a) || 0;
            const bCount = this.availableRpcs.get(b) || 0;
            return bCount - aCount; // descending order
        });
    }

    resetAllFailures() {
        this.failedRpcs.clear();
        logNet('[RPC] Reset all RPC failure statuses');
    }

    // ===== Status and Statistics =====

    getRpcStatus() {
        const status = {
            available: Array.from(this.availableRpcs.entries()),
            failed: Array.from(this.failedRpcs),
            activeRequests: this.activeRequests.size,
            maxParallel: this.maxParallel,
        };
        logNet('[RPC Status]', status);
        return status;
    }

    getStats() {
        return {
            totalAvailable: this.availableRpcs.size,
            totalFailed: this.failedRpcs.size,
            activeRequests: this.activeRequests.size,
            maxParallel: this.maxParallel,
            availableRpcs: Array.from(this.availableRpcs.entries()),
            failedRpcs: Array.from(this.failedRpcs),
        };
    }

    // ===== Core Execution Logic =====

    async executeRpcRequest<T>(
        rpcs: string[],
        requestFn: (rpc: string) => Promise<T>,
        options?: {
            onSuccess?: (rpc: string, result: T) => void;
            onError?: (rpc: string, error: unknown) => void;
            requestId?: string;
        }
    ): Promise<T | null> {
        const requestId = options?.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.activeRequests.add(requestId);

        try {
            const availableRpcs = this.getAvailableRpcsWithFallback(rpcs);
            logNet(`[RPC] Starting parallel with ${availableRpcs.length} RPCs, max: ${this.maxParallel}`);

            return await this.executeParallelRequests(availableRpcs, requestFn, options);
        } finally {
            this.activeRequests.delete(requestId);
        }
    }

    // ===== Private Helper Methods =====

    private getAvailableRpcsWithFallback(rpcs: string[]): string[] {
        let availableRpcs = this.getAvailableRpcs(rpcs);

        if (availableRpcs.length === 0) {
            this.resetAllFailures();
            availableRpcs = this.getAvailableRpcs(rpcs);
        }

        if (availableRpcs.length === 0) {
            availableRpcs = rpcs;
        }

        return availableRpcs;
    }

    private async executeParallelRequests<T>(
        allRpcs: string[],
        requestFn: (rpc: string) => Promise<T>,
        options?: {
            onSuccess?: (rpc: string, result: T) => void;
            onError?: (rpc: string, error: unknown) => void;
        }
    ): Promise<T | null> {
        const usedRpcs = new Set<string>();
        const activeControllers = new Map<string, AbortController>();
        const activePromises = new Map<string, Promise<RequestResult<T>>>();

        // Start initial parallel requests
        const initialRpcs = allRpcs.slice(0, this.maxParallel);
        for (const rpc of initialRpcs) {
            activePromises.set(rpc, this.createRequest(rpc, requestFn, options, activeControllers, usedRpcs));
        }

        logNet(`[RPC] Starting initial ${initialRpcs.length} parallel requests:`, initialRpcs);

        // Process requests with dynamic replacement
        while (activePromises.size > 0) {
            const result = await this.waitForNextCompletion(activePromises);

            if (result.success) {
                this.abortAllRequests(activeControllers);
                return result.result as T;
            }

            // Try to add new RPC to maintain parallel count
            this.tryAddNextRpc(allRpcs, usedRpcs, activePromises, requestFn, options, activeControllers);
        }

        logNet(`[RPC] All RPC requests failed`, allRpcs);
        return null;
    }

    private createRequest<T>(
        rpc: string,
        requestFn: (rpc: string) => Promise<T>,
        options: any,
        activeControllers: Map<string, AbortController>,
        usedRpcs: Set<string>
    ): Promise<RequestResult<T>> {
        const controller = new AbortController();
        activeControllers.set(rpc, controller);
        usedRpcs.add(rpc);

        // logNet(`[RPC] Starting request with RPC: ${rpc}`);

        return requestFn(rpc)
            .then((result) => {
                this.markRpcAvailable(rpc);
                logNet(`[RPC] Success with ${rpc}:`, result);
                options?.onSuccess?.(rpc, result);
                return { success: true, rpc, result };
            })
            .catch((error) => {
                this.handleRequestError(rpc, error, options);
                return { success: false, rpc, error };
            })
            .finally(() => {
                activeControllers.delete(rpc);
                logNet(`[RPC] Request completed for RPC: ${rpc}`);
            });
    }

    private handleRequestError(rpc: string, error: unknown, options: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isRealFailure = isRealRpcFailure(errorMessage);

        if (isRealFailure) {
            this.markRpcFailed(rpc);
            logNet(`[RPC] RPC ${rpc} marked as failed due to real RPC error: ${errorMessage}`);
        } else {
            // For business logic errors, don't mark RPC as failed as this is normal
            logNet(`[RPC] RPC ${rpc} failed with business logic error: ${errorMessage}`);
        }

        options?.onError?.(rpc, error);
    }

    private async waitForNextCompletion<T>(
        activePromises: Map<string, Promise<RequestResult<T>>>
    ): Promise<RequestResult<T>> {
        // logNet(`[RPC] Waiting for completion, active requests: ${activePromises.size}`);

        const [completedRpc, result] = await Promise.race(
            Array.from(activePromises.entries()).map(async ([rpc, promise]) => {
                const result = await promise;
                return [rpc, result] as const;
            })
        );

        activePromises.delete(completedRpc);
        return result;
    }

    private tryAddNextRpc<T>(
        allRpcs: string[],
        usedRpcs: Set<string>,
        activePromises: Map<string, Promise<RequestResult<T>>>,
        requestFn: (rpc: string) => Promise<T>,
        options: any,
        activeControllers: Map<string, AbortController>
    ) {
        const nextRpc = allRpcs.find((rpc) => !usedRpcs.has(rpc));

        if (nextRpc && activePromises.size < this.maxParallel) {
            activePromises.set(nextRpc, this.createRequest(nextRpc, requestFn, options, activeControllers, usedRpcs));
            logNet(
                `[RPC] Added new RPC to parallel pool: ${nextRpc} (${activePromises.size}/${this.maxParallel} active)`
            );
        } else if (!nextRpc) {
            logNet(`[RPC] No more RPCs available, continuing with ${activePromises.size} active requests`);
        }
    }

    private abortAllRequests(activeControllers: Map<string, AbortController>) {
        logNet(`[RPC] Aborting ${activeControllers.size} active requests`);
        activeControllers.forEach((controller) => controller.abort());
        activeControllers.clear();
    }
}

// Type definitions
interface RequestResult<T> {
    success: boolean;
    rpc: string;
    result?: T;
    error?: unknown;
}

// Global RPC manager instance
export const rpcManager = new RpcManager();

// Export convenience functions
export const getRpcManagerStatus = () => {
    return rpcManager.getRpcStatus();
};

export const getRpcManagerStats = () => {
    return rpcManager.getStats();
};

export const resetAllRpcFailures = () => {
    return rpcManager.resetAllFailures();
};

// Export health check functions
export {
    healthCheckRpcs,
    testGasEstimation,
    getHealthCheckResults,
    getWhitelistRpcs,
    getBlacklistRpcs,
    clearHealthCheckResults,
} from './rpc-health-check';
