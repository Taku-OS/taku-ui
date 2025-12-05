# Taku UI - 开发者指南

## 项目结构

```
taku-ui/
├── packages/
│   └── cli/              # CLI 工具包
│       ├── src/
│       │   ├── commands/
│       │   │   ├── init.ts    # 初始化项目命令
│       │   │   └── add.ts     # 添加组件命令
│       │   ├── utils/
│       │   │   ├── logger.ts  # 日志工具
│       │   │   ├── schema.ts  # 配置模式
│       │   │   ├── get-config.ts # 配置管理
│       │   │   └── registry.ts   # 组件注册表工具
│       │   └── index.ts       # CLI 入口
│       └── package.json
├── apps/
│   └── www/              # 文档网站 (Next.js)
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/
│       │   │   └── ui/
│       │   │       └── button.tsx
│       │   └── lib/
│       │       └── utils.ts
│       └── package.json
├── registry/             # 组件注册表
│   ├── index.json       # 组件列表
│   └── components/
│       └── button.json  # Button 组件定义
├── package.json         # 根 package.json
├── pnpm-workspace.yaml  # pnpm workspace 配置
└── turbo.json           # Turbo 构建配置
```

## 开发流程

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建 CLI

```bash
cd packages/cli
pnpm build
```

### 3. 启动文档网站

```bash
cd apps/www
pnpm dev
```

访问 http://localhost:3000 查看文档网站。

### 4. 测试 CLI (本地开发)

在项目根目录链接 CLI:

```bash
cd packages/cli
npm link
```

创建一个测试项目:

```bash
mkdir test-project
cd test-project
npm init -y
npm install react react-dom next
```

初始化 Taku UI:

```bash
taku-ui init
```

添加组件:

```bash
taku-ui add button
```

## 添加新组件

### 1. 创建组件代码

在 `registry/components/` 目录下创建 `your-component.json`:

```json
{
  "name": "your-component",
  "description": "组件描述",
  "dependencies": ["依赖包"],
  "files": [
    {
      "name": "your-component.tsx",
      "content": "组件源代码（字符串形式）"
    }
  ]
}
```

### 2. 更新组件索引

在 `registry/index.json` 中添加:

```json
{
  "name": "your-component",
  "description": "组件描述",
  "dependencies": ["依赖包"]
}
```

### 3. 在文档网站中展示

在 `apps/www/src/app/page.tsx` 或创建新页面展示组件。

## 发布流程

### 1. 发布 CLI 到 npm

```bash
cd packages/cli
pnpm version patch  # 或 minor, major
pnpm publish
```

### 2. 部署文档网站

推荐使用 Vercel:

```bash
cd apps/www
vercel --prod
```

## 核心功能说明

### CLI 命令

#### `taku-ui init`

初始化项目，会:
- 创建 `taku-ui.json` 配置文件
- 安装必要依赖 (Tailwind CSS, Radix UI, CVA 等)
- 创建 `utils.ts` 工具函数
- 创建 `components/ui` 目录

#### `taku-ui add [component]`

添加组件到项目，会:
- 从 registry 读取组件定义
- 复制组件文件到 `src/components/ui/`
- 提示安装所需依赖

### 配置文件 (taku-ui.json)

```json
{
  "$schema": "https://taku-ui.com/schema.json",
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "rsc": false,
  "tsx": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## 技术栈

- **Monorepo**: pnpm workspaces + Turbo
- **CLI**: Commander.js + prompts + ora
- **组件**: React + TypeScript + Radix UI
- **样式**: Tailwind CSS + CVA (Class Variance Authority)
- **文档**: Next.js 14 + App Router

## 常见问题

### Q: 如何在本地测试 CLI？

A: 使用 `npm link` 将 CLI 链接到全局，然后在测试项目中运行命令。

### Q: 如何自定义组件样式？

A: 所有组件都使用 Tailwind CSS，你可以通过修改 `tailwind.config.ts` 和 CSS 变量来自定义主题。

### Q: 支持哪些框架？

A: 当前支持 React + Next.js。未来可以扩展到 Vue、Svelte 等框架。

### Q: 组件是否支持服务端组件 (RSC)？

A: 是的，CLI 会检测你是否使用 Next.js 并询问是否启用 RSC 支持。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-component`)
3. 提交更改 (`git commit -m 'Add amazing component'`)
4. 推送到分支 (`git push origin feature/amazing-component`)
5. 创建 Pull Request

## License

MIT © Taku UI
