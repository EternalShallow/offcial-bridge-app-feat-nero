# RPC Manager & Health Check System

This module provides an intelligent RPC management system for optimizing blockchain RPC request performance and reliability.

## Features

### RPC Manager

- **Parallel Request Processing** - Different RPC requests are executed in parallel
- **Dynamic Whitelist Management** - Automatically mark successful/failed RPCs and sort by success rate
- **Intelligent Error Handling** - Distinguishes between real RPC failures and business logic failures
- **Failover** - Automatically skip failed RPCs and prioritize reliable ones
- **Performance Monitoring** - Provide detailed statistics and debugging capabilities

### Health Check System

- **Basic Connectivity Testing** - Test basic connectivity of RPC endpoints
- **Gas Estimation Testing** - Test gas estimation functionality with real transaction data
- **Response Time Measurement** - Record response time for each RPC
- **Success Rate Tracking** - Track success rate for each RPC
- **Automatic Categorization** - Automatically categorize into whitelist/blacklist based on performance

## Usage

### Basic Usage

```typescript
import { getBlacklistRpcs, getWhitelistRpcs, healthCheckRpcs, rpcManager } from '@/utils/manager/rpc-manager';

// Check RPC manager status
const status = rpcManager.getRpcStatus();
console.log('Available RPCs:', status.available);

// Execute health check
const results = await healthCheckRpcs([
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://rpc.sepolia.org',
    // ... more RPCs
]);

// Get whitelist and blacklist
const whitelist = getWhitelistRpcs();
const blacklist = getBlacklistRpcs();
```

### Advanced Configuration

```typescript
// Custom health check configuration
const config = {
    timeout: 10000, // 10 seconds timeout
    maxRetries: 3, // Maximum retry attempts
    minSuccessRate: 0.7, // Minimum success rate 70%
    maxResponseTime: 5000, // Maximum response time 5 seconds
    testTransactions: [
        // Test transaction data
        {
            to: '0x...',
            value: '0x0',
            data: '0x...',
            from: '0x...',
        },
    ],
};

const results = await healthCheckRpcs(rpcList, config);
```

### Test Scripts

```typescript
// Run independent test scripts
import { runHealthCheckTest, runQuickTest } from './test-health-check';

// Comprehensive test
await runHealthCheckTest();

// Quick test
await runQuickTest();
```

## API Reference

### RPC Manager

#### `rpcManager.executeRpcRequest<T>(rpcs, requestFn, options)`

Execute RPC requests with automatic failover and parallel processing.

#### `rpcManager.getRpcStatus()`

Get current RPC manager status.

#### `rpcManager.getStats()`

Get detailed statistics.

#### `resetAllRpcFailures()`

Reset all RPC failure statuses.

### Health Check

#### `healthCheckRpcs(rpcs, config?)`

Perform health check on multiple RPCs.

#### `testGasEstimation(rpcs, transactions, testName?)`

Test gas estimation with specific transaction data.

#### `getHealthCheckResults()`

Get all health check results.

#### `getWhitelistRpcs()`

Get whitelist RPC list.

#### `getBlacklistRpcs()`

Get blacklist RPC list.

#### `clearHealthCheckResults()`

Clear all health check results.

## Error Handling

The system distinguishes between two types of errors:

### Business Logic Errors (Do not mark RPC as failed)

- `execution reverted`
- `insufficient funds`
- `gas required exceeds allowance`
- `nonce too low`
- etc...

### Real RPC Errors (Mark RPC as failed)

- `failed to fetch`
- `network error`
- `timeout`
- `connection refused`
- etc...

## Performance Optimization

1. **Parallel Processing** - Default maximum 3 parallel requests
2. **Batch Processing** - Health checks are executed in batches to avoid overload
3. **Smart Sorting** - Sort RPCs by success rate
4. **Result Caching** - Health check results are cached

## Monitoring and Debugging

```typescript
// Get detailed status
const status = rpcManager.getRpcStatus();
const stats = rpcManager.getStats();
const healthResults = getHealthCheckResults();

console.log('RPC Manager Status:', status);
console.log('RPC Manager Stats:', stats);
console.log('Health Check Results:', healthResults);
```

## Best Practices

1. **Regular Health Checks** - Recommend running health checks periodically to update RPC status
2. **Monitor Whitelist** - Pay attention to the number of whitelist RPCs to ensure sufficient available RPCs
3. **Error Logs** - Check console logs to understand RPC performance
4. **Configuration Tuning** - Adjust timeout and retry parameters based on network conditions

## Examples

See `use-test-gas.ts` and `test-health-check.ts` files for complete usage examples.
