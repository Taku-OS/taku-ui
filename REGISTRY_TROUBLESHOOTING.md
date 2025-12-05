# Registry 故障排除快速指南

## 🔍 404 错误诊断步骤

### 步骤 1: 验证仓库是否存在

在浏览器中访问：
```
https://github.com/Taku-OS/taku-ui
```

如果仓库不存在，需要：
1. 在 GitHub 上创建仓库 `Taku-OS/taku-ui`
2. 将本地代码推送到 GitHub

### 步骤 2: 检查分支名

GitHub 仓库的默认分支可能是 `main` 或 `master`。

**测试 main 分支**：
```
https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry/index.json
```

**测试 master 分支**：
```
https://raw.githubusercontent.com/Taku-OS/taku-ui/master/registry/index.json
```

如果 `master` 分支可以访问，需要更新 `packages/cli/src/utils/registry.ts`：
```typescript
const DEFAULT_REGISTRY_URL = 'https://raw.githubusercontent.com/Taku-OS/taku-ui/master/registry'
```

### 步骤 3: 验证文件是否已推送

```bash
# 1. 检查本地文件
ls -la registry/index.json

# 2. 检查 Git 状态
git status

# 3. 如果文件未提交，提交并推送
git add registry/
git commit -m "Add registry files"
git push origin main  # 或 master
```

### 步骤 4: 检查文件路径

在 GitHub 仓库页面，确认文件结构：
```
taku-ui/
└── registry/
    ├── index.json
    └── components/
        └── window-controls.json
```

### 步骤 5: 验证仓库可见性

- **公开仓库**：任何人都可以访问 raw.githubusercontent.com
- **私有仓库**：需要认证（见下方解决方案）

## ✅ 快速修复方案

### 方案 A: 首次推送（如果仓库是新的）

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit with registry"

# 4. 添加远程仓库
git remote add origin https://github.com/Taku-OS/taku-ui.git

# 5. 推送到 GitHub
git push -u origin main
```

### 方案 B: 更新现有仓库

```bash
# 1. 确保 registry 目录已提交
git add registry/
git commit -m "Update registry"

# 2. 推送到 GitHub
git push origin main
```

### 方案 C: 检查并修复分支名

```bash
# 查看当前分支
git branch

# 如果默认分支是 master，更新代码中的分支名
# 编辑 packages/cli/src/utils/registry.ts
# 将 main 改为 master
```

## 🔒 私有仓库解决方案

如果仓库是私有的，有两种方案：

### 方案 1: 改为公开仓库（推荐用于开源组件库）

在 GitHub 仓库设置中：
1. Settings → General → Danger Zone
2. Change repository visibility → Make public

### 方案 2: 使用 Personal Access Token

1. 生成 Token：GitHub Settings → Developer settings → Personal access tokens
2. 在 Registry URL 中包含 token：
```
https://YOUR_TOKEN@raw.githubusercontent.com/Taku-OS/taku-ui/main/registry
```

⚠️ **注意**：Token 会暴露在配置中，不够安全。

## 🧪 测试 Registry 是否可用

### 方法 1: 浏览器测试

直接访问：
```
https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry/index.json
```

应该看到 JSON 内容，而不是 404。

### 方法 2: 命令行测试

```bash
# 使用 curl
curl https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry/index.json

# 使用 wget
wget -O- https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry/index.json
```

### 方法 3: 使用 CLI 测试

```bash
# 在测试项目中
npx taku-ui@latest add window-controls
```

## 📝 常见错误信息

### 错误: "Failed to fetch registry: 404 Not Found"

**原因**：
- 仓库不存在
- 分支名错误
- 文件未推送

**解决**：
- 检查仓库 URL
- 验证分支名
- 确保文件已推送

### 错误: "Component not found"

**原因**：
- 组件 JSON 文件不存在
- 组件名称拼写错误

**解决**：
- 检查 `registry/components/` 目录
- 验证组件名称

### 错误: "Network error"

**原因**：
- 网络连接问题
- GitHub 服务不可用

**解决**：
- 检查网络连接
- 稍后重试

## 🎯 验证清单

在发布前，确保：

- [ ] 仓库已在 GitHub 上创建
- [ ] `registry/index.json` 文件存在
- [ ] `registry/components/` 目录包含组件文件
- [ ] 所有文件已提交到 Git
- [ ] 已推送到正确的分支（main 或 master）
- [ ] 可以在浏览器中访问 raw URL
- [ ] 仓库是公开的（或已配置认证）

## 💡 提示

1. **开发时**：CLI 会自动使用本地 `registry/` 目录，无需推送到 GitHub
2. **生产时**：确保 Registry 文件已推送到 GitHub
3. **分支名**：GitHub 新仓库默认使用 `main`，旧仓库可能是 `master`
4. **大小写**：GitHub 对路径大小写敏感，确保完全匹配

