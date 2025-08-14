# Error Handling System

## Overview

A unified error handling system that provides error classification, user prompts, and logging functionality.

## Key Features

### 1. Automatic Error Handling

- HTTP status code handling
- Network error handling
- Wallet transaction error handling
- **API business error handling (code !== 0)**

### 2. Error Classification

- Client Error (CLIENT_ERROR)
- Server Error (SERVER_ERROR)
- Network Error (NETWORK_ERROR)
- Business Error (BUSINESS_ERROR)
- Validation Error (VALIDATION_ERROR)
- Authentication Error (AUTHENTICATION_ERROR)
- Wallet Error (WALLET_ERROR)
- Transaction Error (TRANSACTION_ERROR)

### 3. Error Severity Levels

- Low (LOW)
- Medium (MEDIUM)
- High (HIGH)
- Critical (CRITICAL)

## API Business Error Handling

### Automatic Processing

Axios interceptors automatically detect business error codes (code !== 0) in API responses and handle them uniformly:

```typescript
// Configured in query.provider.tsx
api.interceptors.response.use((response) => {
    const { data } = response;

    // Automatically detect business error codes
    if (data && typeof data.code === 'number' && data.code !== 0) {
        // Automatically map to existing error codes and handle
        const mappedErrorCode = mapBusinessErrorCode(data.code);
        handleError(businessError, mappedErrorCode, data.message);
        return Promise.reject(businessError);
    }

    return response;
});
```

### Business Error Code Mapping

The system automatically maps returned business error codes to existing error codes:

- **Authentication Errors (2000-2999)** → `UNAUTHORIZED`
- **Wallet Errors (4000-4999)** → Corresponding wallet error codes
- **Bridge Errors (5000-5999)** → Corresponding bridge error codes
- **Chain Errors (8000-8999)** → Corresponding chain error codes
- **General Errors (1000-1999)** → Corresponding general error codes
- **Unmapped Error Codes** → `UNKNOWN_ERROR`

### Manual Handling

If you need to handle business errors manually in specific places:

```typescript
import { handleApiBusinessError, isApiBusinessError } from '@/utils/error/error-handler';

// Check if it's a business error
const response = await api.get('/some-endpoint');
if (isApiBusinessError(response.data)) {
    // Manually handle business error (will automatically map error codes)
    handleApiBusinessError(response.data, 'Custom error message');
    return;
}

// Process response normally
console.log(response.data.data);
```

## Usage Examples

### Basic Error Handling

```typescript
import { handleError } from '@/utils/error/error-handler';

try {
    // Your code
} catch (error) {
    handleError(error);
}
```

### Custom Error Codes

```typescript
import { ErrorCode, handleError } from '@/utils/error/error-handler';

try {
    // Your code
} catch (error) {
    handleError(error, ErrorCode.INSUFFICIENT_BALANCE, 'Insufficient balance, please recharge');
}
```

### Silent Error Handling (No Toast)

```typescript
import { handleErrorSilently } from '@/utils/error/error-handler';

try {
    // Your code
} catch (error) {
    handleErrorSilently(error); // Only log errors, don't show prompts
}
```

## Error Code Definitions

### General Errors (1000-1999)

- `SUCCESS = 0` - Success
- `UNKNOWN_ERROR = 1000` - Unknown error
- `INVALID_PARAMETER = 1001` - Invalid parameter
- `REQUEST_TIMEOUT = 1002` - Request timeout
- `NETWORK_ERROR = 1003` - Network error

### Authentication Errors (2000-2999)

- `UNAUTHORIZED = 2000` - Unauthorized
- `INVALID_TOKEN = 2001` - Invalid token
- `TOKEN_EXPIRED = 2002` - Token expired

### Wallet & Transaction Errors (4000-4999)

- `WALLET_NOT_CONNECTED = 4000` - Wallet not connected
- `INSUFFICIENT_BALANCE = 4001` - Insufficient balance
- `INSUFFICIENT_GAS = 4002` - Insufficient gas
- `WALLET_REJECTED = 4003` - Wallet rejected
- `TRANSACTION_FAILED = 4004` - Transaction failed
- `TRANSACTION_TIMEOUT = 4005` - Transaction timeout
- `NONCE_TOO_LOW = 4006` - Nonce too low
- `NONCE_TOO_HIGH = 4007` - Nonce too high
- `GAS_LIMIT_EXCEEDED = 4008` - Gas limit exceeded
- `GAS_PRICE_TOO_LOW = 4009` - Gas price too low
- `EXECUTION_REVERTED = 4010` - Execution reverted

### Bridge Errors (5000-5999)

- `BRIDGE_PAUSED = 5000` - Bridge paused
- `BRIDGE_DISABLED = 5001` - Bridge disabled
- `AMOUNT_TOO_SMALL = 5002` - Amount too small
- `AMOUNT_TOO_LARGE = 5003` - Amount too large
- `INSUFFICIENT_LIQUIDITY = 5004` - Insufficient liquidity
- `NO_ROUTE_FOUND = 5005` - No route found
- `ROUTE_EXPIRED = 5006` - Route expired

### Chain Related Errors (8000-8999)

- `CHAIN_NOT_SUPPORTED = 8000` - Chain not supported
- `RPC_ERROR = 8001` - RPC error
- `RPC_TIMEOUT = 8002` - RPC timeout

## Configuration Options

```typescript
import { ErrorHandler } from '@/utils/error/error-handler';

const errorHandler = new ErrorHandler({
    showToast: true, // Whether to show toast prompts
    logError: true, // Whether to log errors
    locale: 'en', // Language setting ('zh' | 'en')
});
```

## Internationalization Support

Error messages support Chinese and English switching:

```typescript
// Chinese error messages
const errorInfo = getErrorInfo(ErrorCode.INSUFFICIENT_BALANCE, 'zh');
// Output: "余额不足"

// English error messages
const errorInfo = getErrorInfo(ErrorCode.INSUFFICIENT_BALANCE, 'en');
// Output: "Insufficient balance"
```

## Complete Usage Examples

### 1. Automatic Processing (Recommended)

```typescript
// All API calls automatically handle business errors
const response = await api.get('/api/bridge/routes');
// If response.data.code !== 0, automatically display corresponding error prompts
```

### 2. Manual Handling of Specific Errors

```typescript
const response = await api.post('/api/bridge/initiate', {
    fromChain: 'ethereum',
    toChain: 'polygon',
    amount: '100',
});

if (isApiBusinessError(response.data)) {
    // Display different prompts based on business error codes
    switch (response.data.code) {
        case 5000:
            // Bridge paused
            handleError(new Error(response.data.message), ErrorCode.BRIDGE_PAUSED);
            break;
        case 5002:
            // Amount too small
            handleError(new Error(response.data.message), ErrorCode.AMOUNT_TOO_SMALL);
            break;
        default:
            // Other errors automatically mapped
            handleApiBusinessError(response.data);
    }
}
```

### 3. Error Code Mapping Examples

```typescript
// Business error codes → System error codes
4001 → INSUFFICIENT_BALANCE (Insufficient balance)
5000 → BRIDGE_PAUSED (Bridge paused)
8001 → RPC_ERROR (RPC error)
9999 → UNKNOWN_ERROR (Unknown error, unmapped code)
```

### 4. Test Mapping Function

```typescript
import { testBusinessErrorCodeMapping } from '@/utils/error/error-handler-examples';

// Test if error code mapping is correct
testBusinessErrorCodeMapping();
```
