# Registry 配置指南

本指南说明如何设置和使用 GitHub 托管的 Registry 系统来分发你的 UI 组件。

## 📋 目录

- [快速开始](#快速开始)
- [Registry 结构](#registry-结构)
- [配置 Registry URL](#配置-registry-url)
- [发布到 GitHub](#发布到-github)
- [使用方式](#使用方式)

## 🚀 快速开始

### 1. 准备 Registry 文件

确保你的 `registry/` 目录结构如下：

```
registry/
├── index.json          # 组件列表
└── components/
    ├── window-controls.json
    └── ...其他组件.json
```

### 2. 配置 Registry URL

在 `packages/cli/src/utils/registry.ts` 中更新默认 Registry URL：

```typescript
const DEFAULT_REGISTRY_URL = 'https://raw.githubusercontent.com/YOUR_ORG_NAME/taku-ui/main/registry'
```

将 `YOUR_ORG_NAME` 替换为：
- **GitHub 组织名称**（推荐用于公司项目）
- 或 **GitHub 用户名**（个人项目）

> 💡 **提示**：GitHub 组织和个人的 URL 格式完全相同，只需替换组织名或用户名即可。

### 3. 发布到 GitHub

```bash
# 1. 初始化 git（如果还没有）
git init

# 2. 添加 registry 目录
git add registry/

# 3. 提交
git commit -m "Add component registry"

# 4. 推送到 GitHub（使用组织或用户名）
git remote add origin https://github.com/YOUR_ORG_NAME/taku-ui.git
git push -u origin main
```

## 📁 Registry 结构

### index.json

组件列表文件，格式如下：

```json
[
  {
    "name": "window-controls",
    "description": "Window control buttons (close, minimize, maximize) for desktop applications",
    "dependencies": ["class-variance-authority"]
  }
]
```

### components/{name}.json

单个组件的定义文件，格式如下：

```json
{
  "name": "window-controls",
  "description": "Window control buttons (close, minimize, maximize) for desktop applications",
  "dependencies": ["class-variance-authority"],
  "files": [
    {
      "name": "window-controls.tsx",
      "content": "'use client'\n\nimport * as React from 'react'\n..."
    }
  ]
}
```

## ⚙️ 配置 Registry URL

用户可以通过以下三种方式配置 Registry URL（优先级从高到低）：

### 1. 配置文件（推荐）

在项目的 `taku-ui.json` 中添加：

```json
{
  "registryUrl": "https://raw.githubusercontent.com/YOUR_USERNAME/taku-ui/main/registry",
  ...
}
```

### 2. 环境变量

```bash
export TAKU_UI_REGISTRY_URL="https://raw.githubusercontent.com/YOUR_USERNAME/taku-ui/main/registry"
```

### 3. 默认值

如果以上都没有配置，将使用 `registry.ts` 中定义的 `DEFAULT_REGISTRY_URL`。

## 📦 发布到 GitHub

### 步骤 1: 创建 GitHub 仓库

1. 在 GitHub 上创建新仓库（可以是公开或私有）
   - **个人项目**：在你的个人账户下创建
   - **公司项目**：在 GitHub 组织下创建（推荐）
2. 仓库名称建议：`taku-ui` 或 `your-ui-library`

### 步骤 2: 推送 Registry 文件

```bash
# 确保 registry 目录已提交
git add registry/
git commit -m "Add component registry"
git push origin main
```

### 步骤 3: 验证访问

在浏览器中访问：
```
https://raw.githubusercontent.com/YOUR_ORG_NAME/taku-ui/main/registry/index.json
```

将 `YOUR_ORG_NAME` 替换为你的 GitHub 组织名或用户名。应该能看到组件列表 JSON。

### 步骤 4: 发布 CLI 到 npm

```bash
cd packages/cli
npm publish
```

## 💻 使用方式

### 用户安装组件

```bash
# 使用默认 Registry
npx taku-ui@latest add window-controls

# 使用自定义 Registry（通过环境变量）
TAKU_UI_REGISTRY_URL=https://raw.githubusercontent.com/YOUR_ORG_NAME/taku-ui/main/registry \
  npx taku-ui@latest add window-controls

# 使用配置文件中的 Registry URL
# 在 taku-ui.json 中配置 registryUrl 后直接使用
npx taku-ui@latest add window-controls
```

## 🔒 私有 Registry（高级）

如果你需要私有 Registry（不开源），可以：

### 方案 1: GitHub 私有仓库 + Personal Access Token

1. 创建私有 GitHub 仓库（在组织或个人账户下）
2. 生成 Personal Access Token（需要 `repo` 权限）
3. 在 Registry URL 中包含 token：

```
https://YOUR_TOKEN@raw.githubusercontent.com/YOUR_ORG_NAME/taku-ui/main/registry
```

> ⚠️ **注意**：对于组织仓库，确保 token 有访问该组织的权限。

⚠️ **注意**：这种方式 token 会暴露在配置文件中，不够安全。

### 方案 2: 自建服务器

1. 部署静态文件服务器（如 Vercel、Netlify）
2. 添加认证中间件
3. 使用自定义 Registry URL

### 方案 3: GitHub Releases

1. 将 Registry 打包为 release asset
2. 使用 GitHub API 下载（需要认证）
3. 在 CLI 中实现下载逻辑

## 📝 最佳实践

1. **版本管理**：使用 Git tags 管理 Registry 版本
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **CDN 加速**：考虑使用 jsDelivr CDN（免费）
   ```
   https://cdn.jsdelivr.net/gh/YOUR_ORG_NAME/taku-ui@main/registry
   ```

3. **文档站点**：创建组件文档网站（参考 shadcn/ui）

4. **CI/CD**：使用 GitHub Actions 自动验证 Registry 格式

## 🐛 故障排除

### 问题：无法获取 Registry

**解决方案**：
- 检查 GitHub URL 是否正确
- 确认仓库是公开的（或已配置认证）
- 检查网络连接

### 问题：组件安装失败

**解决方案**：
- 检查组件 JSON 格式是否正确
- 确认组件文件内容格式正确
- 查看错误信息中的具体 URL

### 问题：本地开发时无法使用

**解决方案**：
- CLI 会自动检测本地 `registry/` 目录
- 如果存在本地 registry，优先使用本地版本
- 确保 `registry/index.json` 存在

## 📚 参考

- [shadcn/ui Registry 文档](https://ui.shadcn.com/docs/registry)
- [GitHub Raw Content](https://docs.github.com/en/repositories/working-with-files/using-files/viewing-a-file#viewing-raw-files)

