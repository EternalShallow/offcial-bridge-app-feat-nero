# 统一错误处理架构

## 概述

我们采用了一个统一的错误处理架构，将所有错误处理逻辑集中在 `ErrorBoundary` 组件中，避免了重复的错误处理代码。

## 架构设计

### 🎯 **单一职责原则**

- **ErrorBoundary**: 统一的错误处理入口，包含所有错误监控和记录逻辑
- **ErrorDisplay**: 纯展示组件，负责错误UI渲染

### 🔧 **功能整合**

`ErrorBoundary` 现在包含以下所有功能：

1. **React错误边界**: 捕获组件渲染错误
2. **全局错误监控**: 监听 `window.error` 事件
3. **Promise拒绝监控**: 监听 `unhandledrejection` 事件
4. **资源加载错误**: 监控500错误和资源加载失败
5. **网络请求监控**: 拦截fetch和XMLHttpRequest请求
6. **错误日志记录**: 使用统一logger记录所有错误

## 使用方式

### 基本使用

```tsx
import { ErrorBoundary } from '@/components/error';

function App() {
    return (
        <ErrorBoundary>
            <YourApp />
        </ErrorBoundary>
    );
}
```

### 自定义错误UI

```tsx
function CustomErrorUI({ error, resetError }: { error: Error; resetError: () => void }) {
    return (
        <div>
            <h1>自定义错误页面</h1>
            <p>{error.message}</p>
            <button onClick={resetError}>重试</button>
        </div>
    );
}

<ErrorBoundary fallback={CustomErrorUI}>
    <YourApp />
</ErrorBoundary>;
```

## 错误类型监控

### 1. React组件错误

- 组件渲染错误
- 生命周期错误
- 状态更新错误

### 2. 全局JavaScript错误

- 未捕获的异常
- 语法错误
- 运行时错误

### 3. 网络请求错误

- Fetch API错误
- XMLHttpRequest错误
- 500服务器错误

### 4. 资源加载错误

- 图片加载失败
- 脚本加载失败
- 样式文件加载失败

### 5. Promise错误

- 未处理的Promise拒绝
- 异步操作失败

## 错误日志格式

所有错误都会通过统一logger记录，包含以下信息：

```typescript
{
    timestamp: "2024-01-15T10:30:00.000Z",
    level: LogLevel.ERROR,
    category: LogCategory.ERROR,
    title: "错误标题",
    message: "错误消息",
    error: Error对象,
    data: {
        // 错误上下文信息
        url: "当前页面URL",
        userAgent: "浏览器信息",
        componentStack: "React组件栈",
        // 其他相关信息
    }
}
```

## 优势

### ✅ **代码简化**

- 减少了重复的错误处理代码
- 统一的错误处理逻辑
- 更容易维护和扩展

### ✅ **功能完整**

- 覆盖所有类型的错误
- 详细的错误上下文信息
- 统一的日志记录格式

### ✅ **性能优化**

- 单一组件处理所有错误
- 减少组件层级
- 更高效的事件监听

### ✅ **易于调试**

- 集中的错误日志
- 详细的错误信息
- 统一的错误追踪

## 迁移指南

### 从旧架构迁移

**旧方式**:

```tsx
<ErrorBoundary>
    <ErrorMonitor>
        <ErrorTracker />
        <YourApp />
    </ErrorMonitor>
</ErrorBoundary>
```

**新方式**:

```tsx
<ErrorBoundary>
    <YourApp />
</ErrorBoundary>
```

所有功能都已整合到 `ErrorBoundary` 中，无需额外的错误处理组件。

## 配置选项

`ErrorBoundary` 支持以下配置：

```tsx
interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{
        error: Error;
        resetError: () => void;
    }>;
}
```

- `children`: 需要错误保护的组件
- `fallback`: 自定义错误UI组件（可选）

## 最佳实践

1. **在应用根级别使用**: 确保捕获所有错误
2. **提供有意义的错误信息**: 帮助用户理解问题
3. **包含重试机制**: 允许用户恢复操作
4. **记录详细日志**: 便于问题排查
5. **避免敏感信息**: 不要在错误信息中暴露敏感数据
