# 环境变量配置说明

## 📁 环境变量文件

本项目包含以下环境变量配置文件：

### 1. `.env.development` - 开发环境配置
```bash
# API Base URL for development
NEXT_PUBLIC_BASE_URL = "https://bridgex-test.orbiter.finance/api/v1"

# Default host for development
NEXT_PUBLIC_DEFAULT_HOST = "nero.d2ps0ulbl914sr.amplifyapp.com"

# Bridge environment for development
NEXT_PUBLIC_BRIDGE_ENV = "testnet"

# Project ID for API authentication
NEXT_PUBLIC_PROJECT_ID = "d6557f623234b3df721feda833385b9d"

# Node environment
NODE_ENV = "development"
```

### 2. `.env.production` - 生产环境配置
```bash
# API Base URL for production
NEXT_PUBLIC_BASE_URL = "https://bridgex-api.orbiter.finance/api/v1"

# Default host for production
NEXT_PUBLIC_DEFAULT_HOST = "test.d2ps0ulbl914sr.amplifyapp.com"

# Bridge environment for production
NEXT_PUBLIC_BRIDGE_ENV = "mainnet"

# Project ID for API authentication
NEXT_PUBLIC_PROJECT_ID = "d6557f623234b3df721feda833385b9d"

# Node environment
NODE_ENV = "production"
```

### 3. `.env.local` - 本地开发配置（git ignored）
```bash
# API Base URL for local development
NEXT_PUBLIC_BASE_URL = "https://bridgex-test.orbiter.finance/api/v1"

# Default host for local development
NEXT_PUBLIC_DEFAULT_HOST = "nero.d2ps0ulbl914sr.amplifyapp.com"

# Bridge environment for local development
NEXT_PUBLIC_BRIDGE_ENV = "testnet"

# Project ID for API authentication
NEXT_PUBLIC_PROJECT_ID = "d6557f623234b3df721feda833385b9d"

# Node environment
NODE_ENV = "development"
```

## 🔧 环境变量说明

### `NEXT_PUBLIC_BASE_URL`
- **用途**: API 请求的基础 URL
- **开发环境**: 使用测试网 API
- **生产环境**: 使用主网 API

### `NEXT_PUBLIC_DEFAULT_HOST`
- **用途**: 应用的默认主机地址（备用值）
- **注意**: 实际使用的 host 值由 `getBridgeHost()` 函数根据环境自动确定

### `NEXT_PUBLIC_BRIDGE_ENV`
- **用途**: 桥接环境配置，决定使用哪个 host
- **开发环境**: `testnet` → 自动使用 `test.d2ps0ulbl914sr.amplifyapp.com`
- **生产环境**: `mainnet` → 自动使用 `nero.d2ps0ulbl914sr.amplifyapp.com`

### `NEXT_PUBLIC_PROJECT_ID`
- **用途**: API 认证的项目 ID
- **值**: `d6557f623234b3df721feda833385b9d`
- **说明**: 用于 API 请求的认证头，所有 API 请求都会自动添加此请求头

### `NODE_ENV`
- **用途**: Node.js 运行环境
- **开发环境**: `development`
- **生产环境**: `production`

## 🎯 Host 值自动确定

项目使用智能 host 确定逻辑：

```typescript
export const getBridgeHost = (): string => {
    if (isTestnet) {
        return 'test.d2ps0ulbl914sr.amplifyapp.com';  // 测试环境
    } else if (isMainnet) {
        return 'nero.d2ps0ulbl914sr.amplifyapp.com';  // 生产环境
    } else {
        return DEFAULT_HOST || 'test.d2ps0ulbl914sr.amplifyapp.com';  // 备用值
    }
};
```

**优势**:
- ✅ 无需手动配置 host 值
- ✅ 根据环境自动选择正确的配置
- ✅ 减少配置错误的可能性
- ✅ 便于环境切换

## 🚀 使用方法

### 开发环境
```bash
# 自动使用 .env.development 配置
pnpm dev
```

### 生产环境
```bash
# 自动使用 .env.production 配置
pnpm build
pnpm start
```

### 本地自定义配置
1. 复制 `.env.local.example` 为 `.env.local`
2. 修改 `.env.local` 中的值
3. `.env.local` 文件不会被提交到版本控制

## 📝 注意事项

1. **环境变量优先级**: `.env.local` > `.env.development`/`.env.production` > 默认值
2. **NEXT_PUBLIC_ 前缀**: 只有以 `NEXT_PUBLIC_` 开头的环境变量才能在客户端使用
3. **安全性**: 敏感信息（如 API 密钥）不应放在客户端环境变量中
4. **版本控制**: `.env.local` 文件已被 `.gitignore` 忽略，不会被提交
5. **API 认证**: `PROJECT_ID` 会自动添加到所有 API 请求的请求头中

## 🔍 验证配置

可以通过以下方式验证环境变量是否正确加载：

```typescript
// 在组件中检查环境变量
console.log('API URL:', process.env.NEXT_PUBLIC_BASE_URL);
console.log('Bridge Env:', process.env.NEXT_PUBLIC_BRIDGE_ENV);
console.log('Project ID:', process.env.NEXT_PUBLIC_PROJECT_ID);
console.log('Node Env:', process.env.NODE_ENV);
```

## 🛠️ API 请求头配置

项目已配置自动添加以下请求头：

- **`projectId`**: 从环境变量 `NEXT_PUBLIC_PROJECT_ID` 自动获取
- **`Content-Type`**: 自动设置为 `application/json`

这些请求头会在所有 API 请求中自动添加，无需手动配置。 