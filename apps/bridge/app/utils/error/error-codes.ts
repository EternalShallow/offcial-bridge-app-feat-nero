/**
 * Error Code Enumeration and Error Handling
 *
 * Defines common interface error codes and provides unified error handling mechanism
 */

// HTTP Status Code Enumeration
export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
}

// Business Error Code Enumeration
export enum ErrorCode {
    // General Errors (1000-1999)
    SUCCESS = 0,
    UNKNOWN_ERROR = 1000,
    INVALID_PARAMETER = 1001,
    REQUEST_TIMEOUT = 1002,
    NETWORK_ERROR = 1003,

    // Authentication & Authorization Errors (2000-2999)
    UNAUTHORIZED = 2000,
    INVALID_TOKEN = 2001,
    TOKEN_EXPIRED = 2002,

    // Wallet & Transaction Errors (4000-4999)
    WALLET_NOT_CONNECTED = 4000,
    INSUFFICIENT_BALANCE = 4001,
    INSUFFICIENT_GAS = 4002,
    WALLET_REJECTED = 4003,
    TRANSACTION_FAILED = 4004,
    TRANSACTION_TIMEOUT = 4005,
    NONCE_TOO_LOW = 4006,
    NONCE_TOO_HIGH = 4007,
    GAS_LIMIT_EXCEEDED = 4008,
    GAS_PRICE_TOO_LOW = 4009,
    EXECUTION_REVERTED = 4010,

    // Bridge Related Errors (5000-5999)
    BRIDGE_PAUSED = 5000,
    BRIDGE_DISABLED = 5001,
    AMOUNT_TOO_SMALL = 5002,
    AMOUNT_TOO_LARGE = 5003,
    INSUFFICIENT_LIQUIDITY = 5004,
    NO_ROUTE_FOUND = 5005,
    ROUTE_EXPIRED = 5006,

    // Chain Related Errors (8000-8999)
    CHAIN_NOT_SUPPORTED = 8000,
    RPC_ERROR = 8001,
    RPC_TIMEOUT = 8002,
}

// Error Message Mapping (Chinese)
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    [ErrorCode.SUCCESS]: '操作成功',
    [ErrorCode.UNKNOWN_ERROR]: '未知错误，请稍后重试',
    [ErrorCode.INVALID_PARAMETER]: '参数错误，请检查输入',
    [ErrorCode.REQUEST_TIMEOUT]: '请求超时，请稍后重试',
    [ErrorCode.NETWORK_ERROR]: '网络错误，请检查网络连接',

    [ErrorCode.UNAUTHORIZED]: '未授权，请重新登录',
    [ErrorCode.INVALID_TOKEN]: '无效的访问令牌',
    [ErrorCode.TOKEN_EXPIRED]: '访问令牌已过期，请重新登录',

    [ErrorCode.WALLET_NOT_CONNECTED]: '钱包未连接，请先连接钱包',
    [ErrorCode.INSUFFICIENT_BALANCE]: '余额不足',
    [ErrorCode.INSUFFICIENT_GAS]: 'Gas 余额不足，无法支付手续费',
    [ErrorCode.WALLET_REJECTED]: '用户拒绝了交易',
    [ErrorCode.TRANSACTION_FAILED]: '交易失败',
    [ErrorCode.TRANSACTION_TIMEOUT]: '交易超时',
    [ErrorCode.NONCE_TOO_LOW]: 'Nonce 过低，请等待或手动调整',
    [ErrorCode.NONCE_TOO_HIGH]: 'Nonce 过高',
    [ErrorCode.GAS_LIMIT_EXCEEDED]: 'Gas 限制超出',
    [ErrorCode.GAS_PRICE_TOO_LOW]: 'Gas 价格过低',
    [ErrorCode.EXECUTION_REVERTED]: '交易执行被回滚',

    [ErrorCode.BRIDGE_PAUSED]: '桥接服务已暂停',
    [ErrorCode.BRIDGE_DISABLED]: '桥接服务已禁用',
    [ErrorCode.AMOUNT_TOO_SMALL]: '金额过小，低于最小限额',
    [ErrorCode.AMOUNT_TOO_LARGE]: '金额过大，超过最大限额',
    [ErrorCode.INSUFFICIENT_LIQUIDITY]: '流动性不足',
    [ErrorCode.NO_ROUTE_FOUND]: '未找到可用路由',
    [ErrorCode.ROUTE_EXPIRED]: '路由已过期',

    [ErrorCode.CHAIN_NOT_SUPPORTED]: '不支持的区块链网络',
    [ErrorCode.RPC_ERROR]: 'RPC 节点错误',
    [ErrorCode.RPC_TIMEOUT]: 'RPC 节点超时',
};

// Error Message Mapping (English)
export const ERROR_MESSAGES_EN: Record<ErrorCode, string> = {
    [ErrorCode.SUCCESS]: 'Success',
    [ErrorCode.UNKNOWN_ERROR]: 'Unknown error, please try again later',
    [ErrorCode.INVALID_PARAMETER]: 'Invalid parameter, please check your input',
    [ErrorCode.REQUEST_TIMEOUT]: 'Request timeout, please try again later',
    [ErrorCode.NETWORK_ERROR]: 'Network error, please check your connection',

    [ErrorCode.UNAUTHORIZED]: 'Unauthorized, please login again',
    [ErrorCode.INVALID_TOKEN]: 'Invalid access token',
    [ErrorCode.TOKEN_EXPIRED]: 'Access token expired, please login again',

    [ErrorCode.WALLET_NOT_CONNECTED]: 'Wallet not connected, please connect your wallet first',
    [ErrorCode.INSUFFICIENT_BALANCE]: 'Insufficient balance',
    [ErrorCode.INSUFFICIENT_GAS]: 'Insufficient gas balance to pay transaction fee',
    [ErrorCode.WALLET_REJECTED]: 'User rejected the transaction',
    [ErrorCode.TRANSACTION_FAILED]: 'Transaction failed',
    [ErrorCode.TRANSACTION_TIMEOUT]: 'Transaction timeout',
    [ErrorCode.NONCE_TOO_LOW]: 'Nonce too low, please wait or adjust manually',
    [ErrorCode.NONCE_TOO_HIGH]: 'Nonce too high',
    [ErrorCode.GAS_LIMIT_EXCEEDED]: 'Gas limit exceeded',
    [ErrorCode.GAS_PRICE_TOO_LOW]: 'Gas price too low',
    [ErrorCode.EXECUTION_REVERTED]: 'Transaction execution reverted',

    [ErrorCode.BRIDGE_PAUSED]: 'Bridge service is paused',
    [ErrorCode.BRIDGE_DISABLED]: 'Bridge service is disabled',
    [ErrorCode.AMOUNT_TOO_SMALL]: 'Amount too small, below minimum limit',
    [ErrorCode.AMOUNT_TOO_LARGE]: 'Amount too large, exceeds maximum limit',
    [ErrorCode.INSUFFICIENT_LIQUIDITY]: 'Insufficient liquidity',
    [ErrorCode.NO_ROUTE_FOUND]: 'No route found',
    [ErrorCode.ROUTE_EXPIRED]: 'Route expired',

    [ErrorCode.CHAIN_NOT_SUPPORTED]: 'Unsupported blockchain network',
    [ErrorCode.RPC_ERROR]: 'RPC node error',
    [ErrorCode.RPC_TIMEOUT]: 'RPC node timeout',
};

// Error Type Enumeration
export enum ErrorType {
    CLIENT_ERROR = 'CLIENT_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    BUSINESS_ERROR = 'BUSINESS_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    WALLET_ERROR = 'WALLET_ERROR',
    TRANSACTION_ERROR = 'TRANSACTION_ERROR',
}

// Error Severity Enumeration
export enum ErrorSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

// Error Information Interface
export interface ErrorInfo {
    code: ErrorCode;
    message: string;
    type: ErrorType;
    severity: ErrorSeverity;
    details?: string;
    timestamp?: number;
    requestId?: string;
}

/**
 * Get error information based on error code and locale
 * @param code - Error code
 * @param locale - Language locale ('zh' for Chinese, 'en' for English)
 * @returns Error information object
 */
export function getErrorInfo(code: ErrorCode, locale: 'en' | 'zh' = 'en'): ErrorInfo {
    const message = locale === 'zh' ? ERROR_MESSAGES[code] : ERROR_MESSAGES_EN[code];

    // Determine error type and severity based on error code
    let type: ErrorType;
    let severity: ErrorSeverity;

    if (code >= ErrorCode.UNAUTHORIZED && code <= ErrorCode.TOKEN_EXPIRED) {
        type = ErrorType.AUTHENTICATION_ERROR;
        severity = ErrorSeverity.HIGH;
    } else if (code >= ErrorCode.WALLET_NOT_CONNECTED && code <= ErrorCode.EXECUTION_REVERTED) {
        type = code === ErrorCode.WALLET_REJECTED ? ErrorType.WALLET_ERROR : ErrorType.TRANSACTION_ERROR;
        severity = code === ErrorCode.WALLET_REJECTED ? ErrorSeverity.LOW : ErrorSeverity.HIGH;
    } else if (code >= ErrorCode.BRIDGE_PAUSED && code <= ErrorCode.ROUTE_EXPIRED) {
        type = ErrorType.BUSINESS_ERROR;
        severity = ErrorSeverity.HIGH;
    } else if (code >= ErrorCode.CHAIN_NOT_SUPPORTED && code <= ErrorCode.RPC_TIMEOUT) {
        type = ErrorType.NETWORK_ERROR;
        severity = ErrorSeverity.MEDIUM;
    } else if (code === ErrorCode.INVALID_PARAMETER) {
        type = ErrorType.VALIDATION_ERROR;
        severity = ErrorSeverity.MEDIUM;
    } else if (code >= ErrorCode.REQUEST_TIMEOUT && code <= ErrorCode.NETWORK_ERROR) {
        type = ErrorType.NETWORK_ERROR;
        severity = ErrorSeverity.MEDIUM;
    } else {
        type = ErrorType.CLIENT_ERROR;
        severity = ErrorSeverity.LOW;
    }

    return {
        code,
        message,
        type,
        severity,
        timestamp: Date.now(),
    };
}

/**
 * Get error code from HTTP status code
 * @param status - HTTP status code
 * @returns Corresponding error code
 */
export function getErrorCodeFromHttpStatus(status: number): ErrorCode {
    switch (status) {
        case HttpStatus.BAD_REQUEST:
            return ErrorCode.INVALID_PARAMETER;
        case HttpStatus.UNAUTHORIZED:
            return ErrorCode.UNAUTHORIZED;
        case HttpStatus.FORBIDDEN:
            return ErrorCode.UNAUTHORIZED;
        case HttpStatus.NOT_FOUND:
            return ErrorCode.UNKNOWN_ERROR;
        case HttpStatus.METHOD_NOT_ALLOWED:
            return ErrorCode.INVALID_PARAMETER;
        case HttpStatus.CONFLICT:
            return ErrorCode.UNKNOWN_ERROR;
        case HttpStatus.UNPROCESSABLE_ENTITY:
            return ErrorCode.INVALID_PARAMETER;
        case HttpStatus.TOO_MANY_REQUESTS:
            return ErrorCode.REQUEST_TIMEOUT;
        case HttpStatus.INTERNAL_SERVER_ERROR:
            return ErrorCode.UNKNOWN_ERROR;
        case HttpStatus.BAD_GATEWAY:
        case HttpStatus.SERVICE_UNAVAILABLE:
        case HttpStatus.GATEWAY_TIMEOUT:
            return ErrorCode.NETWORK_ERROR;
        default:
            return ErrorCode.UNKNOWN_ERROR;
    }
}

/**
 * Map business error code to existing error code
 * @param businessCode - Business error code from API response
 * @returns Corresponding error code
 */
export function mapBusinessErrorCode(businessCode: number): ErrorCode {
    // Map business error codes to existing error codes
    switch (businessCode) {
        // Authentication errors (2000-2999)
        case 2000:
        case 2001:
        case 2002:
            return ErrorCode.UNAUTHORIZED;

        // Wallet & Transaction errors (4000-4999)
        case 4000:
            return ErrorCode.WALLET_NOT_CONNECTED;
        case 4001:
            return ErrorCode.INSUFFICIENT_BALANCE;
        case 4002:
            return ErrorCode.INSUFFICIENT_GAS;
        case 4003:
            return ErrorCode.WALLET_REJECTED;
        case 4004:
            return ErrorCode.TRANSACTION_FAILED;
        case 4005:
            return ErrorCode.TRANSACTION_TIMEOUT;
        case 4006:
            return ErrorCode.NONCE_TOO_LOW;
        case 4007:
            return ErrorCode.NONCE_TOO_HIGH;
        case 4008:
            return ErrorCode.GAS_LIMIT_EXCEEDED;
        case 4009:
            return ErrorCode.GAS_PRICE_TOO_LOW;
        case 4010:
            return ErrorCode.EXECUTION_REVERTED;

        // Bridge errors (5000-5999)
        case 5000:
            return ErrorCode.BRIDGE_PAUSED;
        case 5001:
            return ErrorCode.BRIDGE_DISABLED;
        case 5002:
            return ErrorCode.AMOUNT_TOO_SMALL;
        case 5003:
            return ErrorCode.AMOUNT_TOO_LARGE;
        case 5004:
            return ErrorCode.INSUFFICIENT_LIQUIDITY;
        case 5005:
            return ErrorCode.NO_ROUTE_FOUND;
        case 5006:
            return ErrorCode.ROUTE_EXPIRED;

        // Chain errors (8000-8999)
        case 8000:
            return ErrorCode.CHAIN_NOT_SUPPORTED;
        case 8001:
            return ErrorCode.RPC_ERROR;
        case 8002:
            return ErrorCode.RPC_TIMEOUT;

        // General errors (1000-1999)
        case 1001:
            return ErrorCode.INVALID_PARAMETER;
        case 1002:
            return ErrorCode.REQUEST_TIMEOUT;
        case 1003:
            return ErrorCode.NETWORK_ERROR;

        // Default to unknown error for unmapped codes
        default:
            return ErrorCode.UNKNOWN_ERROR;
    }
}
