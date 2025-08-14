# 统一Logger使用指南

## 概述

我们创建了一个统一的全局单例logger，支持不同环境的日志级别和输出方式，提供更好的错误追踪和调试体验。

## 特性

- 🎯 **全局单例**：确保整个应用使用同一个logger实例
- 🌍 **环境适配**：根据开发、测试、生产环境自动调整配置
- 📊 **日志分级**：DEBUG、INFO、WARN、ERROR、CRITICAL五个级别
- 🏷️ **分类管理**：按功能模块分类日志（API、交易、网络等）
- 📤 **远程日志**：支持发送日志到远程服务器
- 🔄 **向后兼容**：保持原有API的兼容性

## 环境配置

### 开发环境 (Development)

```typescript
{
    level: LogLevel.DEBUG,        // 显示所有日志
    enableConsole: true,          // 启用控制台输出
    enableRemote: false,          // 禁用远程日志
    maxBufferSize: 100,           // 缓冲区大小
    flushInterval: 5000,          // 刷新间隔5秒
}
```

### 测试环境 (Testnet)

```typescript
{
    level: LogLevel.INFO,         // 显示INFO及以上级别
    enableConsole: true,          // 启用控制台输出
    enableRemote: true,           // 启用远程日志
    remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
    maxBufferSize: 50,            // 较小的缓冲区
    flushInterval: 10000,         // 刷新间隔10秒
}
```

### 生产环境 (Production)

```typescript
{
    level: LogLevel.WARN,         // 只显示WARN及以上级别
    enableConsole: false,         // 禁用控制台输出
    enableRemote: true,           // 启用远程日志
    remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
    maxBufferSize: 100,           // 标准缓冲区
    flushInterval: 30000,         // 刷新间隔30秒
}
```

## 使用方法

### 1. 基本使用

```typescript
import { LogCategory, LogLevel, logger } from '@/utils/logger';

// 调试信息
logger.debug(LogCategory.DEBUG, 'Debug message', { data: 'debug info' });

// 一般信息
logger.info(LogCategory.GENERAL, 'Info message', { data: 'info' });

// 警告信息
logger.warn(LogCategory.BRIDGE, 'Warning message', { data: 'warning' });

// 错误信息
logger.error(LogCategory.ERROR, 'Error message', new Error('Something went wrong'));

// 严重错误
logger.critical(LogCategory.ERROR, 'Critical error', new Error('System failure'));
```

### 2. 按分类使用

```typescript
// API相关日志
logger.info(LogCategory.API, 'API request', { endpoint: '/api/data' });
logger.error(LogCategory.API, 'API error', error, { status: 500 });

// 交易相关日志
logger.info(LogCategory.TRANSACTION, 'Transaction started', { txHash: '0x...' });
logger.warn(LogCategory.TRANSACTION, 'Transaction pending', { gasPrice: '20 gwei' });

// 网络相关日志
logger.info(LogCategory.NETWORK, 'Network connected', { chainId: 1 });
logger.error(LogCategory.NETWORK, 'Network error', error, { rpcUrl: 'https://...' });

// 钱包相关日志
logger.info(LogCategory.WALLET, 'Wallet connected', { address: '0x...' });
logger.error(LogCategory.WALLET, 'Wallet error', error, { provider: 'metamask' });

// Bridge相关日志
logger.info(LogCategory.BRIDGE, 'Bridge operation', { from: 'ETH', to: 'ENI' });
logger.error(LogCategory.BRIDGE, 'Bridge error', error, { amount: '1 ETH' });
```

### 3. 向后兼容API

```typescript
import { log, logError, logNet, logTx } from '@/utils/logger';

// 原有API仍然可用
log('General message', { data: 'info' });
logTx('Transaction info', { hash: '0x...' });
logNet('Network info', { status: 'connected' });
logError('Error occurred', new Error('Something wrong'));
```

### 4. 配置管理

```typescript
import { LogLevel, logger } from '@/utils/logger';

// 更新配置
logger.updateConfig({
    level: LogLevel.DEBUG,
    enableConsole: true,
    enableRemote: false,
});

// 获取当前配置
const config = logger.getConfig();
console.log('Current logger config:', config);
```

## 日志级别

### LogLevel枚举

```typescript
enum LogLevel {
    DEBUG = 0, // 调试信息，开发环境使用
    INFO = 1, // 一般信息，记录应用状态
    WARN = 2, // 警告信息，需要注意但不影响运行
    ERROR = 3, // 错误信息，功能异常但可恢复
    CRITICAL = 4, // 严重错误，系统级问题
}
```

### LogCategory枚举

```typescript
enum LogCategory {
    GENERAL = 'general', // 一般日志
    API = 'api', // API相关
    TRANSACTION = 'transaction', // 交易相关
    NETWORK = 'network', // 网络相关
    ERROR = 'error', // 错误相关
    DEBUG = 'debug', // 调试相关
    BRIDGE = 'bridge', // Bridge相关
    WALLET = 'wallet', // 钱包相关
}
```

## 输出格式

### 控制台输出

```
🔍🐛【Debug message】: { data: 'debug info' }
ℹ️📝【Info message】: { data: 'info' }
⚠️🌉【Warning message】: { data: 'warning' }
❌💥【Error message】: Error: Something went wrong { status: 500 }
🚨💥【Critical error】: Error: System failure { system: 'down' }
```

### 远程日志格式

```json
{
    "logs": [
        {
            "timestamp": "2024-01-15T10:30:00.000Z",
            "level": 1,
            "category": "api",
            "title": "API request",
            "message": null,
            "data": { "endpoint": "/api/data" },
            "error": null,
            "context": null
        }
    ],
    "environment": "production",
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 最佳实践

### 1. 选择合适的日志级别

- **DEBUG**: 详细的调试信息，仅在开发环境使用
- **INFO**: 记录重要的应用状态变化
- **WARN**: 记录需要注意但不影响功能的情况
- **ERROR**: 记录功能异常但可恢复的错误
- **CRITICAL**: 记录系统级严重错误

### 2. 使用合适的分类

- 根据功能模块选择合适的分类
- 便于日志过滤和分析
- 提高日志的可读性

### 3. 包含有用的上下文信息

```typescript
logger.error(LogCategory.API, 'API call failed', error, {
    endpoint: '/api/data',
    method: 'POST',
    params: { id: 123 },
    userId: 'user123',
    timestamp: new Date().toISOString(),
});
```

### 4. 避免敏感信息

```typescript
// ❌ 不要记录敏感信息
logger.info(LogCategory.WALLET, 'Wallet info', {
    privateKey: '0x123...', // 敏感信息
    password: 'secret', // 敏感信息
});

// ✅ 只记录必要信息
logger.info(LogCategory.WALLET, 'Wallet connected', {
    address: '0x123...', // 公开信息
    network: 'mainnet', // 公开信息
});
```

## 环境变量配置

```bash
# 远程日志端点（可选）
NEXT_PUBLIC_LOG_ENDPOINT=https://logs.orbiter.finance/api/logs

# 日志级别（可选，默认根据环境自动设置）
NEXT_PUBLIC_LOG_LEVEL=INFO

# 启用远程日志（可选，默认根据环境自动设置）
NEXT_PUBLIC_ENABLE_REMOTE_LOGS=true
```

## 迁移指南

### 从旧版logger迁移

```typescript
// 旧版
import { log, logTx, logNet, logError } from '@/utils/log';

log('Message', { data: 'info' });
logTx('Tx info', { hash: '0x...' });
logNet('Net info', { status: 'connected' });
logError('Error', error);

// 新版（推荐）
import { logger, LogCategory } from '@/utils/logger';

logger.info(LogCategory.GENERAL, 'Message', { data: 'info' });
logger.info(LogCategory.TRANSACTION, 'Tx info', { hash: '0x...' });
logger.info(LogCategory.NETWORK, 'Net info', { status: 'connected' });
logger.error(LogCategory.ERROR, 'Error', error);

// 或者继续使用兼容API
import { log, logTx, logNet, logError } from '@/utils/logger';
// 使用方式与旧版完全相同
```

## 故障排除

### 1. 日志不显示

- 检查日志级别配置
- 确认环境变量设置正确
- 检查控制台过滤器设置

### 2. 远程日志发送失败

- 检查网络连接
- 确认远程端点配置正确
- 查看浏览器控制台错误信息

### 3. 性能问题

- 调整缓冲区大小
- 增加刷新间隔
- 减少不必要的日志输出
