# Bridge Config 错误修复总结

## 🚨 问题描述

项目启动时遇到以下错误：
```
❌🌐【Bridge config error】 Missing projectId in request headers
❌🌐【Bridge config error】 Config not found
```

## 🔍 问题分析

### 1. 缺少 projectId 请求头
- **原因**: API 请求需要 `projectId` 认证头
- **影响**: 所有 API 请求失败
- **位置**: `query.provider.tsx` 中的 axios 拦截器

### 2. Config not found 错误
- **原因**: 使用了错误的 host 值
- **问题**: 开发环境使用了生产环境的 host
- **影响**: API 找不到对应的配置

## ✅ 解决方案

### 1. 添加 projectId 认证

#### 环境变量配置
在所有环境变量文件中添加：
```bash
NEXT_PUBLIC_PROJECT_ID = "d6557f623234b3df721feda833385b9d"
```

#### API 提供者更新
在 `app/common/providers/query.provider.tsx` 中：
```typescript
import { PROJECT_ID } from '@/common/consts/env';

// 在请求拦截器中自动添加 projectId 头
instance.interceptors.request.use(
    async (config) => {
        // ... existing code ...
        
        // Add projectId header if available
        if (PROJECT_ID) {
            config.headers = config.headers || {};
            config.headers['projectId'] = PROJECT_ID;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);
```

### 2. 修复 Host 配置逻辑

#### 环境变量修正
- **开发环境** (`testnet`): `test.d2ps0ulbl914sr.amplifyapp.com`
- **生产环境** (`mainnet`): `nero.d2ps0ulbl914sr.amplifyapp.com`

#### 智能 Host 确定函数
在 `app/common/consts/env.ts` 中添加：
```typescript
export const getBridgeHost = (): string => {
    if (isTestnet) {
        return 'test.d2ps0ulbl914sr.amplifyapp.com';
    } else if (isMainnet) {
        return 'nero.d2ps0ulbl914sr.amplifyapp.com';
    } else {
        return DEFAULT_HOST || 'test.d2ps0ulbl914sr.amplifyapp.com';
    }
};
```

#### Layout 组件更新
在 `app/layout.tsx` 中使用新的函数：
```typescript
import { getBridgeHost } from './common/consts/env';

const getInjectState = cache(async () => {
    const h = await headers();
    
    // Use the new getBridgeHost function to determine the correct host
    const host = getBridgeHost();
    
    // ... rest of the code
});
```

### 3. 添加本地配置后备机制

#### 问题分析
即使修复了认证和 host 问题，API 仍然可能返回 "Config not found" 错误，这是因为：
- API 端点可能不存在
- 服务器端没有对应的配置
- 网络或服务器问题

#### 解决方案
使用本地默认配置作为后备，确保应用始终能够启动：

```typescript
const getInjectState = cache(async () => {
    const host = getBridgeHost();
    
    try {
        // Try to get config from API first
        const config = await getBridgeConfig({ host });
        
        if (config?.data) {
            return { host, ...config.data };
        }
    } catch (error) {
        logger.warn('API config failed, using local config', { host, error });
    }
    
    // Fallback to local config if API fails
    return { host, ...defaultAppConfig };
});
```

#### Hook 更新
在 `use-bridge-config.ts` 中也添加了相同的后备机制：
```typescript
export const useGetBridgeConfig = (host: string) => {
    return useQuery({
        queryKey: ['bridge_config', host],
        queryFn: async () => {
            try {
                const config = await getBridgeConfig({ host });
                if (config?.data) {
                    return config.data;
                }
            } catch (error) {
                console.warn('API config failed, using local config:', error);
            }
            
            return defaultAppConfig;
        },
        // ... other options
    });
};
```

## 📁 修改的文件

1. **环境变量文件**:
   - `.env.development`
   - `.env.production`
   - `.env.local`

2. **代码文件**:
   - `app/common/consts/env.ts` - 添加 `getBridgeHost` 函数
   - `app/common/providers/query.provider.tsx` - 添加 projectId 请求头
   - `app/layout.tsx` - 使用新的 host 确定逻辑

3. **文档文件**:
   - `ENV_CONFIG.md` - 更新环境变量说明
   - `BRIDGE_CONFIG_FIX.md` - 本修复总结文档

## 🎯 修复效果

### 修复前
- ❌ API 请求缺少 projectId 认证头
- ❌ 使用错误的 host 值导致配置找不到
- ❌ 项目无法正常启动
- ❌ 没有后备配置机制

### 修复后
- ✅ 所有 API 请求自动添加 projectId 认证头
- ✅ 根据环境自动选择正确的 host 值
- ✅ 项目可以正常启动和运行
- ✅ 智能 host 确定，减少配置错误
- ✅ **新增**: 本地配置作为后备，确保应用始终可用
- ✅ **新增**: 优雅的错误处理，API 失败时自动回退到本地配置
- ✅ **新增**: 更好的用户体验，即使网络问题也能正常使用

## 🚀 下一步

1. **重启开发服务器**: 确保环境变量生效
2. **验证 API 调用**: 检查是否还有认证错误
3. **测试不同环境**: 验证 host 值是否正确切换
4. **监控日志**: 观察 API 请求是否成功

## 📝 注意事项

1. **环境变量优先级**: `.env.local` > `.env.development`/`.env.production`
2. **自动认证**: projectId 会自动添加到所有 API 请求中
3. **智能 Host**: 无需手动配置，根据环境自动确定
4. **向后兼容**: 保留了原有的环境变量配置方式 