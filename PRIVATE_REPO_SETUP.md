# 私有仓库配置指南

如果你的 `taku-ui` 仓库是私有的，需要配置 GitHub Token 才能让 CLI 访问组件。

## 🔑 快速开始

### 步骤 1: 生成 GitHub Personal Access Token

> 💡 **重要说明**：Token 是在你的**个人 GitHub 账户**下生成的，不是组织级别的。但可以授权 token 访问组织仓库。

#### 方法 1: 通过网页生成（推荐）

1. **访问 Token 设置页面**：
   ```
   https://github.com/settings/tokens
   ```
   或者：
   - 点击右上角头像 → **Settings**
   - 左侧菜单最下方 → **Developer settings**
   - 点击 **Personal access tokens** → **Tokens (classic)**

2. **生成新 Token**：
   - 点击 **"Generate new token"** → 选择 **"Generate new token (classic)"**

3. **配置 Token**：
   - **Note（备注）**: `Taku UI CLI` 或 `Taku-OS Registry Access`（描述用途，方便识别）
   - **Expiration（过期时间）**: 
     - 选择 `90 days`（推荐，更安全）
     - 或 `No expiration`（方便但安全性较低）
   - **Select scopes（选择权限）**: 
     - ✅ **`repo`** - Full control of private repositories
       - 这会展开子选项，确保勾选：
         - ✅ `repo:status`
         - ✅ `repo_deployment`
         - ✅ `public_repo`（如果仓库是公开的）
         - ✅ `repo:invite`
         - ✅ `security_events`

4. **生成并复制 Token**：
   - 点击页面底部的 **"Generate token"** 按钮
   - ⚠️ **重要**：立即复制 token（格式：`ghp_xxxxxxxxxxxx`）
   - Token 只会显示一次，关闭页面后无法再查看
   - 如果忘记复制，需要删除旧 token 重新生成

#### 方法 2: 通过命令行生成（高级）

如果你安装了 GitHub CLI (`gh`)，可以使用命令行：

```bash
# 安装 GitHub CLI（如果还没有）
brew install gh  # macOS
# 或访问 https://cli.github.com/

# 登录 GitHub
gh auth login

# 生成 token（交互式）
gh auth token
```

#### 针对组织仓库的特殊步骤

如果你的仓库在组织下（如 `Taku-OS/taku-ui`），生成 token 后可能需要额外授权：

1. **生成 token 后**，GitHub 可能会显示一个横幅，提示需要组织授权
2. **点击授权链接**，或访问：
   ```
   https://github.com/settings/tokens
   ```
3. **找到你刚生成的 token**，在右侧会显示组织图标
4. **点击组织图标**（如 `Taku-OS`）
5. **点击 "Grant" 或 "授权"**，批准 token 访问组织
6. 如果组织启用了 **SSO（单点登录）**，还需要：
   - 点击 token 右侧的 **"Enable SSO"** 或 **"Configure SSO"**
   - 选择组织 `Taku-OS`
   - 点击 **"Authorize"** 授权

### 步骤 2: 设置环境变量

#### macOS / Linux

```bash
# 临时设置（当前终端会话）
export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 永久设置（添加到 ~/.zshrc 或 ~/.bashrc）
echo 'export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx' >> ~/.zshrc
source ~/.zshrc
```

#### Windows (PowerShell)

```powershell
# 临时设置（当前会话）
$env:TAKU_UI_GITHUB_TOKEN="ghp_xxxxxxxxxxxx"

# 永久设置（用户级别）
[System.Environment]::SetEnvironmentVariable('TAKU_UI_GITHUB_TOKEN', 'ghp_xxxxxxxxxxxx', 'User')
```

#### Windows (CMD)

```cmd
# 临时设置
set TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 永久设置（需要重启）
setx TAKU_UI_GITHUB_TOKEN "ghp_xxxxxxxxxxxx"
```

### 步骤 3: 验证配置

```bash
# 检查环境变量是否设置
echo $TAKU_UI_GITHUB_TOKEN  # macOS/Linux
echo %TAKU_UI_GITHUB_TOKEN%  # Windows CMD
$env:TAKU_UI_GITHUB_TOKEN   # Windows PowerShell

# 测试 CLI（应该能正常访问私有仓库）
npx taku-ui@latest add window-controls
```

## 🏢 组织仓库配置

如果你的仓库在 GitHub 组织下（如 `Taku-OS/taku-ui`），需要确保：

### 重要：可能不需要额外授权！

**很多情况下，如果组织没有启用严格的第三方访问限制，token 可以直接使用，无需额外授权。**

**建议先测试 token 是否有效**（见下方测试方法），如果测试成功，说明不需要额外授权。

### 如果需要组织授权

1. **在 Token 列表中查找**：
   - 访问：https://github.com/settings/tokens
   - 找到你的 token
   - 查看 token 右侧是否有组织图标（如 `Taku-OS`）
   - 如果有，点击组织图标 → 点击 "Grant" 授权

2. **通过组织设置查找**：
   - 访问：https://github.com/organizations/Taku-OS/settings
   - 左侧菜单 → **Third-party access** → **Personal access tokens**
   - 查看是否有待授权的 token

3. **如果组织启用了 SSO**：
   - 在 token 列表中，找到你的 token
   - 点击 "Configure SSO" 或 "配置 SSO"
   - 选择组织 `Taku-OS` → 点击 "Authorize"

### 测试 Token 是否有效

**快速测试**：
```bash
# 替换 YOUR_TOKEN 为你的实际 token
# ⚠️ URL 必须用引号包裹（macOS/zsh 需要）
curl -H "Authorization: token YOUR_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/Taku-OS/taku-ui/contents/registry/index.json?ref=main"
```

**如果返回 JSON 数据**：✅ Token 有效，可以直接使用！
**如果返回 401/403**：需要检查权限或组织授权
**如果返回 404**：检查文件路径或确认文件已推送

详细测试方法请参考 `TEST_TOKEN.md` 文件。

## 🔐 安全最佳实践

### ✅ 推荐做法

1. **使用环境变量**：Token 存储在环境变量中，不会暴露在代码或配置文件中
2. **最小权限原则**：只授予 `repo` 权限，不要授予不必要的权限
3. **定期轮换**：建议每 90 天更新一次 token
4. **不要提交到 Git**：确保 `.env` 文件在 `.gitignore` 中

### ❌ 避免的做法

1. **不要在 URL 中包含 token**：
   ```bash
   # ❌ 不安全
   https://TOKEN@raw.githubusercontent.com/...
   ```

2. **不要硬编码在代码中**：
   ```typescript
   // ❌ 不安全
   const token = 'ghp_xxxxxxxxxxxx'
   ```

3. **不要分享 token**：每个开发者应该使用自己的 token

## 🧪 测试私有仓库访问

### 方法 1: 使用 CLI 测试

```bash
# 设置 token
export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 测试添加组件
npx taku-ui@latest add window-controls
```

### 方法 2: 使用 curl 测试 GitHub API

```bash
# 测试访问 registry/index.json
curl -H "Authorization: token ghp_xxxxxxxxxxxx" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/repos/Taku-OS/taku-ui/contents/registry/index.json?ref=main
```

应该返回 JSON 响应，包含文件内容（base64 编码）。

## 🐛 故障排除

### 错误: "GitHub token is required for private repositories"

**原因**：未设置 `TAKU_UI_GITHUB_TOKEN` 环境变量

**解决**：
```bash
export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

### 错误: "Authentication failed"

**原因**：
- Token 无效或已过期
- Token 没有 `repo` 权限
- Token 没有访问组织的权限

**解决**：
1. 检查 token 是否正确
2. 重新生成 token，确保有 `repo` 权限
3. 如果是组织仓库，确保已授权 token 访问组织

### 错误: "File not found"

**原因**：
- 文件路径不正确
- 分支名错误
- 文件未推送到 GitHub

**解决**：
1. 检查文件是否存在于 GitHub 仓库
2. 验证分支名（`main` 或 `master`）
3. 确保文件已提交并推送

## 📝 验证清单

- [ ] 已生成 GitHub Personal Access Token
- [ ] Token 有 `repo` 权限
- [ ] 如果是组织仓库，已授权 token 访问组织
- [ ] 已设置 `TAKU_UI_GITHUB_TOKEN` 环境变量
- [ ] 已验证环境变量设置成功
- [ ] 已测试 CLI 可以访问私有仓库

## 💡 提示

1. **开发时**：CLI 会自动使用本地 `registry/` 目录，无需 token
2. **生产时**：需要设置 token 才能访问私有仓库
3. **CI/CD**：在 CI 环境中，通过 secrets 设置环境变量
4. **团队协作**：每个团队成员需要设置自己的 token

## 🔄 从公开仓库迁移到私有仓库

如果你之前使用公开仓库，现在改为私有：

1. 在 GitHub 上更改仓库可见性为 Private
2. 设置 `TAKU_UI_GITHUB_TOKEN` 环境变量
3. CLI 会自动切换到使用 GitHub API

无需修改任何代码或配置！

