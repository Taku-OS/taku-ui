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

如果你的仓库是私有的，CLI 会自动检测并使用 GitHub API 来访问组件。

### 方案 1: 使用 GitHub Personal Access Token（推荐）

1. **生成 Personal Access Token**：
   - 访问：GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 点击 "Generate new token (classic)"
   - 选择权限：至少需要 `repo` 权限（对于私有仓库）
   - 对于组织仓库，确保 token 有访问该组织的权限
   - 复制生成的 token（格式：`ghp_xxxxxxxxxxxx`）

2. **设置环境变量**：
   ```bash
   # macOS/Linux
   export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
   
   # Windows (PowerShell)
   $env:TAKU_UI_GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
   
   # Windows (CMD)
   set TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
   ```

3. **使用 CLI**：
   ```bash
   # CLI 会自动检测 token 并使用 GitHub API
   npx taku-ui@latest add window-controls
   ```

> ✅ **优势**：Token 不会暴露在 URL 或配置文件中，更安全。

### 方案 2: 改为公开仓库（如果组件库是开源的）

如果你的组件库是开源的，最简单的方式是将仓库改为公开：

1. 在 GitHub 仓库设置中：
   - Settings → General → Danger Zone
   - Change repository visibility → Make public

2. 之后就可以直接使用，无需 token：
   ```bash
   npx taku-ui@latest add window-controls
   ```

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

### 问题：404 Not Found 错误

当你访问 Registry URL 时出现 404 错误，可能的原因和解决方案：

#### 1. 仓库尚未创建或推送

**检查步骤**：
```bash
# 检查是否已推送到 GitHub
git remote -v

# 如果没有远程仓库，添加并推送
git remote add origin https://github.com/Taku-OS/taku-ui.git
git push -u origin main
```

**解决方案**：
- 确保仓库已在 GitHub 上创建
- 确保 `registry/` 目录已提交并推送
- 验证文件是否在正确的分支上

#### 2. 分支名不正确

**检查步骤**：
访问以下 URL 测试不同分支：
- `https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry/index.json`
- `https://raw.githubusercontent.com/Taku-OS/taku-ui/master/registry/index.json`

**解决方案**：
如果默认分支是 `master` 而不是 `main`，更新 `registry.ts` 中的 URL：
```typescript
const DEFAULT_REGISTRY_URL = 'https://raw.githubusercontent.com/Taku-OS/taku-ui/master/registry'
```

#### 3. 文件路径不正确

**检查步骤**：
1. 在 GitHub 上查看仓库，确认 `registry/index.json` 文件存在
2. 检查文件路径大小写是否匹配（GitHub 对大小写敏感）

**解决方案**：
- 确保文件路径完全匹配
- 检查是否有拼写错误

#### 4. 仓库是私有的 ⚠️

**检查步骤**：
- 确认仓库的可见性设置
- 尝试在浏览器中访问仓库主页（需要登录）

**解决方案**：
- **方案 1（推荐）**：设置 GitHub Token 环境变量
  ```bash
  export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
  ```
  CLI 会自动使用 GitHub API 访问私有仓库。

- **方案 2**：将仓库改为公开（如果组件库是开源的）
  - Settings → General → Danger Zone → Make public

#### 5. 快速验证清单

```bash
# 1. 检查本地文件是否存在
ls -la registry/index.json

# 2. 检查 Git 状态
git status

# 3. 检查远程仓库
git remote -v

# 4. 检查当前分支
git branch

# 5. 验证推送
git log --oneline -5
```

### 问题：无法获取 Registry

**解决方案**：
- 检查 GitHub URL 是否正确
- 确认仓库是公开的（或已配置认证）
- 检查网络连接
- 验证组织名称是否正确（`Taku-OS`）

### 问题：组件安装失败

**解决方案**：
- 检查组件 JSON 格式是否正确
- 确认组件文件内容格式正确
- 查看错误信息中的具体 URL
- 验证组件文件是否已推送到 GitHub

### 问题：本地开发时无法使用

**解决方案**：
- CLI 会自动检测本地 `registry/` 目录
- 如果存在本地 registry，优先使用本地版本
- 确保 `registry/index.json` 存在
- 开发时，CLI 会优先使用本地文件，无需推送到 GitHub

## 📚 参考

- [shadcn/ui Registry 文档](https://ui.shadcn.com/docs/registry)
- [GitHub Raw Content](https://docs.github.com/en/repositories/working-with-files/using-files/viewing-a-file#viewing-raw-files)

