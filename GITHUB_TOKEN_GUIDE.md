# GitHub Token 生成指南（组织仓库）

## 📍 Token 在哪里生成？

Token 是在你的**个人 GitHub 账户**下生成的，不是组织级别的。但可以授权 token 访问组织仓库。

## 🚀 详细步骤（图文说明）

### 步骤 1: 进入 Token 设置页面

**方法 A: 直接访问链接**
```
https://github.com/settings/tokens
```

**方法 B: 通过界面导航**
1. 点击 GitHub 右上角的**头像**
2. 点击 **Settings（设置）**
3. 滚动到页面最下方，点击 **Developer settings（开发者设置）**
4. 左侧菜单选择 **Personal access tokens（个人访问令牌）**
5. 点击 **Tokens (classic)（令牌（经典））**

### 步骤 2: 生成新 Token

1. 点击页面右上角的 **"Generate new token"** 按钮
2. 选择 **"Generate new token (classic)"**

   > 💡 为什么选择 classic？
   - Classic token 支持更多权限
   - Fine-grained token（细粒度令牌）还在测试阶段，可能不支持所有功能

### 步骤 3: 配置 Token

#### 3.1 基本信息

- **Note（备注）**: 
  ```
  Taku UI CLI - Taku-OS Registry Access
  ```
  这个名称会显示在 token 列表中，方便识别用途

- **Expiration（过期时间）**: 
  - `90 days`（推荐，更安全）
  - `No expiration`（方便但安全性较低，适合 CI/CD）

#### 3.2 选择权限（Scopes）

**必须勾选的权限**：

✅ **`repo`** - Full control of private repositories

点击 `repo` 前面的箭头展开，确保以下子权限也被勾选：
- ✅ `repo:status` - 访问提交状态
- ✅ `repo_deployment` - 访问部署状态
- ✅ `public_repo` - 访问公开仓库（如果仓库是公开的）
- ✅ `repo:invite` - 访问仓库邀请
- ✅ `security_events` - 访问安全事件

**其他可选权限**（通常不需要）：
- ❌ `admin:repo_hook` - 管理仓库 webhooks
- ❌ `delete_repo` - 删除仓库
- ❌ 其他权限根据实际需求选择

### 步骤 4: 生成并复制 Token

1. 滚动到页面底部
2. 点击绿色的 **"Generate token"** 按钮
3. **立即复制 token**（格式：`ghp_xxxxxxxxxxxx`）
   - Token 只会显示一次
   - 关闭页面后无法再查看
   - 建议保存到密码管理器或安全的地方

### 步骤 5: 授权 Token 访问组织（重要！）

如果你的仓库在组织下（如 `Taku-OS/taku-ui`），**必须**授权 token 访问组织：

#### 方法 A: 自动提示授权

1. 生成 token 后，GitHub 可能会显示一个横幅：
   ```
   ⚠️ Some organizations require approval for this token
   ```
2. 点击 **"Grant"** 或 **"授权"** 按钮
3. 选择组织 `Taku-OS`
4. 点击 **"Approve"** 或 **"批准"**

#### 方法 B: 手动授权

1. 返回 Token 列表页面：
   ```
   https://github.com/settings/tokens
   ```
2. 找到你刚生成的 token（通过 Note 名称识别）
3. 在 token 右侧，你会看到组织图标（如 `Taku-OS`）
4. 点击组织图标
5. 点击 **"Grant"** 或 **"授权"**

#### 方法 C: 如果组织启用了 SSO

如果组织启用了 SSO（单点登录），需要额外步骤：

1. 在 token 列表中，找到你的 token
2. 在 token 右侧，点击 **"Configure SSO"** 或 **"配置 SSO"**
3. 选择组织 `Taku-OS`
4. 点击 **"Authorize"** 或 **"授权"**
5. 可能需要输入组织的 SSO 密码或进行二次验证

### 步骤 6: 验证 Token 是否有效

#### 方法 1: 使用 curl 测试

```bash
# 替换 YOUR_TOKEN 为你的实际 token
curl -H "Authorization: token YOUR_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/repos/Taku-OS/taku-ui/contents/registry/index.json?ref=main
```

如果返回 JSON 数据（包含 `content` 字段），说明 token 有效。

如果返回 `401 Unauthorized` 或 `403 Forbidden`，说明：
- Token 无效或已过期
- Token 没有 `repo` 权限
- Token 未授权访问组织

#### 方法 2: 使用 GitHub CLI 测试

```bash
# 设置 token
export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 测试访问
gh api repos/Taku-OS/taku-ui/contents/registry/index.json?ref=main
```

#### 方法 3: 使用 Taku UI CLI 测试

```bash
# 设置 token
export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 测试添加组件
npx taku-ui@latest add window-controls
```

## 🔍 如何查看已生成的 Token？

**重要**：GitHub 不会显示 token 的完整内容，只能看到：
- Token 名称（Note）
- 创建时间
- 过期时间
- 权限范围
- 最后使用时间

如果忘记 token，需要：
1. 删除旧 token
2. 重新生成新 token

## 🗑️ 如何删除或撤销 Token？

1. 访问：https://github.com/settings/tokens
2. 找到要删除的 token
3. 点击右侧的 **"Delete"** 或 **"删除"** 按钮
4. 确认删除

## ⚠️ 常见问题

### Q1: 找不到 "Generate new token" 按钮？

**A**: 确保你访问的是正确的页面：
- ✅ https://github.com/settings/tokens
- ❌ 不是组织的 Settings 页面

### Q2: Token 生成后无法访问组织仓库？

**A**: 检查以下几点：
1. Token 是否已授权访问组织（见步骤 5）
2. 你的账户是否有访问组织的权限
3. 组织是否启用了 SSO（需要额外授权）

### Q3: 组织管理员在哪里管理 Token 授权？

**A**: 组织管理员可以：
1. 访问组织 Settings：`https://github.com/organizations/Taku-OS/settings`
2. 左侧菜单 → **Third-party access** → **Personal access tokens**
3. 查看和管理所有待授权的 token

### Q4: 可以使用 Fine-grained token 吗？

**A**: 目前建议使用 Classic token，因为：
- Fine-grained token 还在测试阶段
- 可能不支持所有 GitHub API 功能
- Classic token 更稳定可靠

### Q5: Token 可以给多人使用吗？

**A**: 不建议共享 token。每个开发者应该：
- 生成自己的 token
- 设置自己的环境变量
- 这样更安全，也方便追踪使用情况

## 📝 检查清单

生成 token 前，确保：

- [ ] 已登录正确的 GitHub 账户
- [ ] 账户有访问 `Taku-OS` 组织的权限
- [ ] 知道仓库的完整路径：`Taku-OS/taku-ui`
- [ ] 知道仓库的分支名：`main` 或 `master`

生成 token 后，确保：

- [ ] 已复制 token（格式：`ghp_xxxxxxxxxxxx`）
- [ ] Token 有 `repo` 权限
- [ ] Token 已授权访问 `Taku-OS` 组织
- [ ] 如果组织有 SSO，已启用 SSO 授权
- [ ] 已测试 token 可以访问仓库

## 💡 提示

1. **Token 安全**：
   - 不要将 token 提交到 Git 仓库
   - 不要分享 token 给他人
   - 定期轮换 token（建议每 90 天）

2. **环境变量**：
   - 使用环境变量存储 token，不要硬编码
   - 开发时：设置本地环境变量
   - CI/CD：使用 secrets 管理

3. **组织权限**：
   - 如果你是组织成员，通常可以直接授权
   - 如果不是成员，需要组织管理员批准

4. **多个组织**：
   - 一个 token 可以授权访问多个组织
   - 在 token 设置页面可以管理所有组织授权

