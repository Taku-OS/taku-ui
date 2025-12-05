# 发布 Taku UI 组件库指南

本指南说明如何将 Taku UI 组件库发布，让其他人可以使用。

## 📋 发布前检查清单

- [ ] Registry 文件已更新并提交
- [ ] Registry 已推送到 GitHub
- [ ] CLI 代码已构建
- [ ] npm 账户已登录
- [ ] 包名可用性已确认

## 🚀 发布步骤

### 步骤 1: 提交 Registry 到 GitHub

```bash
cd /Users/ldx/project/Company_Project/taku_test_ui/taku-ui

# 添加所有更改
git add registry/
git add packages/cli/src/
git add *.md

# 提交更改
git commit -m "feat: add window-controls component and icons

- Add window-controls component
- Add window-control-icons component
- Update CLI to support auto-detection
- Add GitHub registry support for private repos"

# 推送到 GitHub
git push origin main
```

### 步骤 2: 验证 Registry 可访问

在浏览器中访问以下 URL，确认可以访问：

```
https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry/index.json
```

应该能看到组件列表 JSON。

### 步骤 3: 构建 CLI

```bash
cd packages/cli

# 构建 CLI
pnpm build

# 验证构建成功
ls -la dist/
```

确保 `dist/index.js` 文件存在且可执行。

### 步骤 4: 检查 npm 包名可用性

```bash
# 检查包名是否可用
npm view taku-ui

# 如果返回 404，说明包名可用
# 如果返回包信息，说明包名已被占用，需要修改 package.json 中的 name
```

如果包名被占用，可以：
- 使用组织作用域：`@taku-os/ui` 或 `@taku-os/taku-ui`
- 使用其他名称：`taku-ui-cli` 或 `@your-org/taku-ui`

### 步骤 5: 登录 npm

```bash
# 登录 npm（如果还没登录）
npm login

# 输入你的 npm 用户名、密码和邮箱
```

### 步骤 6: 发布到 npm

```bash
cd packages/cli

# 发布（首次发布）
npm publish

# 或者发布为公开包（如果包名包含 scope）
npm publish --access public
```

### 步骤 7: 验证发布成功

```bash
# 检查包是否发布成功
npm view taku-ui

# 应该能看到包的详细信息
```

## 📦 使用方式

发布后，其他人可以通过以下方式使用：

### 方式 1: 直接使用（推荐）

```bash
# 初始化项目
npx taku-ui@latest init

# 添加组件
npx taku-ui@latest add window-controls
npx taku-ui@latest add window-control-icons
```

### 方式 2: 全局安装

```bash
# 全局安装
npm install -g taku-ui

# 使用
taku-ui init
taku-ui add window-controls
```

### 方式 3: 项目依赖

```bash
# 安装为项目依赖
npm install -D taku-ui

# 在 package.json 中添加脚本
{
  "scripts": {
    "ui:add": "taku-ui add"
  }
}

# 使用
npm run ui:add window-controls
```

## 🔒 私有仓库配置

如果你的仓库是私有的，用户需要：

1. **生成 GitHub Token**（见 `PRIVATE_REPO_SETUP.md`）
2. **设置环境变量**：
   ```bash
   export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
   ```
3. **使用 CLI**：
   ```bash
   npx taku-ui@latest add window-controls
   ```

## 📝 版本管理

### 更新版本号

```bash
cd packages/cli

# 更新版本号（patch/minor/major）
npm version patch  # 0.0.1 -> 0.0.2
npm version minor  # 0.0.1 -> 0.1.0
npm version major  # 0.0.1 -> 1.0.0

# 自动创建 git tag 并提交
git push --tags
```

### 发布新版本

```bash
# 1. 更新版本号
npm version patch

# 2. 构建
pnpm build

# 3. 发布
npm publish
```

## 🎯 发布后验证

### 测试安装

```bash
# 创建一个测试项目
mkdir test-taku-ui
cd test-taku-ui
npm init -y

# 测试安装
npx taku-ui@latest init
npx taku-ui@latest add window-controls
```

### 检查 Registry 访问

```bash
# 测试 Registry 访问（如果是公开仓库）
curl https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry/index.json

# 如果是私有仓库，需要设置 token
export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
npx taku-ui@latest add window-controls
```

## 📚 文档更新

发布后，建议更新以下文档：

1. **README.md** - 添加使用说明和示例
2. **GETTING_STARTED.md** - 快速开始指南
3. **创建文档网站** - 展示所有组件（可选）

## 🔄 持续发布流程

每次添加新组件后：

```bash
# 1. 更新 registry
# - 添加组件 JSON 到 registry/components/
# - 更新 registry/index.json

# 2. 提交并推送
git add registry/
git commit -m "feat: add new-component"
git push origin main

# 3. 更新 CLI 版本并发布
cd packages/cli
npm version patch
pnpm build
npm publish
```

## ⚠️ 常见问题

### Q: npm publish 失败，提示包名被占用

**A**: 修改 `packages/cli/package.json` 中的 `name` 字段：
```json
{
  "name": "@taku-os/ui",  // 使用组织作用域
  // 或
  "name": "taku-ui-cli"   // 使用其他名称
}
```

### Q: 发布后用户无法访问组件

**A**: 检查：
1. Registry 是否已推送到 GitHub
2. GitHub 仓库是否为公开（或用户已配置 token）
3. Registry URL 是否正确

### Q: 如何撤销发布？

**A**: 
```bash
# 撤销发布（24小时内）
npm unpublish taku-ui@0.0.1

# 或发布新版本覆盖
npm version patch
npm publish
```

## 🎉 发布完成

发布成功后，其他人就可以使用：

```bash
npx taku-ui@latest add window-controls
```

恭喜！你的组件库已经可以供其他人使用了！🎊

