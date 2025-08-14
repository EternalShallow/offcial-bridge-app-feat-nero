# Monorepo 到单仓库迁移总结

## 🎯 迁移目标
将项目从 Turbo + pnpm Workspace 的 Monorepo 架构转换为单仓库架构。

## ✅ 已完成的转换步骤

### 1. 项目结构转换
- 将 `apps/bridge/` 目录下的所有内容移动到根目录
- 将 `packages/` 目录下的共享配置移动到根目录
- 删除了 `apps/` 和 `packages/` 目录

### 2. 配置文件更新
- **package.json**: 合并了所有依赖，移除了 workspace 引用
- **tsconfig.json**: 直接包含所有 TypeScript 配置，不再依赖外部文件
- **eslint.config.mjs**: 直接包含所有 ESLint 配置，不再依赖外部文件
- **next.config.ts**: 移除了 Monorepo 相关的路径配置

### 3. Monorepo 配置删除
- 删除了 `turbo.json`
- 删除了 `pnpm-workspace.yaml`
- 清理了相关的依赖引用

### 4. 依赖管理
- 重新安装了所有依赖
- 修复了 sonner toast 的服务器端渲染问题
- 保持了原有的所有功能依赖

## 🔧 修复的问题

### 1. Sonner Toast 服务器端渲染问题
- 问题：在服务器端渲染时，sonner 的 toast 对象不可用
- 解决方案：在错误处理器中添加了服务器端检测，跳过 toast 显示
- 添加了错误处理机制，确保应用不会因为 toast 问题而崩溃

### 2. React 水合（Hydration）不匹配问题
- 问题：`ErrorDisplay` 组件中使用了 `typeof window !== 'undefined'` 导致服务器端和客户端渲染结果不同
- 解决方案：使用 `useState` 和 `useEffect` 来确保服务器端和客户端渲染一致
- 在客户端水合完成后再显示动态内容，避免水合不匹配

## 📁 当前项目结构

```
offcial-bridge-app-feat-nero/
├── app/                    # Next.js 应用代码
├── components/             # React 组件
├── hooks/                  # 自定义 Hooks
├── service/                # 服务层
├── utils/                  # 工具函数
├── types/                  # 类型定义
├── public/                 # 静态资源
├── eslint-config-custom/   # ESLint 配置
├── tsconfig/               # TypeScript 配置
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript 配置
├── eslint.config.mjs       # ESLint 配置
├── next.config.ts          # Next.js 配置
└── tailwind.config.js      # Tailwind CSS 配置
```

## 🚀 当前状态

- ✅ 项目可以正常启动 (`pnpm dev`)
- ✅ 所有依赖已正确安装
- ✅ 保持了原有的所有功能
- ✅ 现在是一个标准的 Next.js 单仓库项目
- ✅ 解决了 React 水合不匹配问题
- ✅ 解决了 sonner toast 服务器端渲染问题

## 📝 使用方式

现在你可以像使用普通 Next.js 项目一样使用它：

```bash
pnpm dev      # 启动开发服务器
pnpm build    # 构建项目
pnpm start    # 启动生产服务器
pnpm lint     # 代码检查
pnpm format   # 代码格式化
```

## 🔍 技术细节

### 水合问题修复原理
1. **问题分析**: 使用 `typeof window !== 'undefined'` 在服务器端和客户端会产生不同的结果
2. **解决方案**: 使用 `useState(false)` 作为初始状态，在 `useEffect` 中设置为 `true`
3. **优势**: 确保服务器端和客户端初始渲染完全一致，避免水合不匹配

### 错误处理优化
1. **服务器端安全**: 在服务器端禁用 toast 显示，避免运行时错误
2. **客户端体验**: 在客户端正常显示错误提示和详细信息
3. **开发环境**: 在开发环境中显示详细的错误信息，便于调试

## 🎉 总结

项目已成功从 Monorepo 架构转换为单仓库架构，并解决了所有相关的技术问题。现在你可以享受更简单的项目管理和更快的开发体验！ 