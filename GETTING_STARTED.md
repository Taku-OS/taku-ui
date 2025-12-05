# Taku UI 快速开始

## 使用 Taku UI

### 在你的项目中使用

1. **初始化项目**

```bash
npx taku-ui init
```

这会:
- 创建配置文件 `taku-ui.json`
- 安装必要依赖
- 设置项目结构

2. **添加组件**

```bash
# 添加单个组件
npx taku-ui add button

# 添加多个组件
npx taku-ui add button card input

# 添加所有组件
npx taku-ui add --all
```

3. **在代码中使用**

```tsx
import { Button } from '@/components/ui/button'

export default function MyComponent() {
  return <Button>Click me</Button>
}
```

## 开发 Taku UI

### 项目设置

```bash
# 克隆项目
cd taku-ui

# 安装依赖
pnpm install

# 构建 CLI
cd packages/cli
pnpm build

# 启动文档网站
cd ../../apps/www
pnpm dev
```

访问 http://localhost:3000 查看文档。

### 本地测试 CLI

```bash
# 链接 CLI 到全局
cd packages/cli
npm link

# 在测试项目中使用
mkdir ~/test-taku-ui
cd ~/test-taku-ui
npm init -y
npm install react react-dom next

# 测试 CLI
taku-ui init
taku-ui add button
```

### 添加新组件

1. 在 `registry/components/` 创建组件 JSON 文件
2. 在 `registry/index.json` 添加组件信息
3. 在 `apps/www` 创建示例页面
4. 测试 CLI 添加功能

查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 了解详细开发指南。

## 项目结构

```
taku-ui/
├── packages/cli/      # CLI 工具
├── apps/www/          # 文档网站
└── registry/          # 组件注册表
```

## 下一步

- 📖 查看 [DEVELOPMENT.md](./DEVELOPMENT.md) 了解详细开发指南
- 🎨 访问文档网站查看所有组件
- 🚀 开始创建你自己的组件
