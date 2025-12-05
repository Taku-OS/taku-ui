# 测试 GitHub Token 是否有效

## 🧪 快速测试方法

### 方法 1: 使用 curl 测试（最简单）

```bash
# 替换 YOUR_TOKEN 为你的实际 token
# 例如：ghp_xxxxxxxxxxxx
# ⚠️ 注意：URL 必须用引号包裹（zsh 需要）
curl -H "Authorization: token YOUR_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     "https://api.github.com/repos/Taku-OS/taku-ui/contents/registry/index.json?ref=main"
```

**macOS/zsh 用户注意**：URL 必须用引号包裹，否则 zsh 会把 `?` 当作通配符。

**预期结果**：
- ✅ **成功**：返回 JSON 数据（包含 `content` 字段，内容是 base64 编码的）
- ❌ **失败**：返回错误信息

**常见错误**：
- `401 Unauthorized` - Token 无效或已过期
- `403 Forbidden` - Token 没有权限或需要组织授权
- `404 Not Found` - 文件不存在或路径错误

### 方法 2: 使用 Taku UI CLI 测试

```bash
# 1. 设置环境变量
export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 2. 测试添加组件
npx taku-ui@latest add window-controls
```

**预期结果**：
- ✅ **成功**：组件安装成功
- ❌ **失败**：显示错误信息

### 方法 3: 使用 GitHub CLI 测试（如果已安装）

```bash
# 设置 token
export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# 测试访问
gh api repos/Taku-OS/taku-ui/contents/registry/index.json?ref=main
```

## 🔍 如果测试失败，检查以下问题

### 问题 1: Token 无效或已过期

**检查**：
1. 返回 `401 Unauthorized`
2. Token 格式是否正确（应该以 `ghp_` 开头）

**解决**：
- 重新生成 token
- 确保复制完整（没有多余空格）

### 问题 2: Token 没有 repo 权限

**检查**：
1. 返回 `403 Forbidden`
2. 错误信息提到权限不足

**解决**：
1. 访问：https://github.com/settings/tokens
2. 找到你的 token
3. 点击 token 名称进入详情页
4. 检查是否有 `repo` 权限
5. 如果没有，删除旧 token，重新生成并勾选 `repo` 权限

### 问题 3: 需要组织授权

**检查**：
1. 返回 `403 Forbidden`
2. 错误信息提到组织或第三方访问

**解决**：见下方"如何找到组织授权"

### 问题 4: 文件路径错误

**检查**：
1. 返回 `404 Not Found`
2. 确认仓库路径：`Taku-OS/taku-ui`
3. 确认分支名：`main` 或 `master`
4. 确认文件存在：`registry/index.json`

**解决**：
- 检查 GitHub 仓库，确认文件路径正确
- 确认文件已推送到 GitHub

## 🔐 如何找到组织授权

### 方法 1: 在 Token 列表中查找

1. 访问：https://github.com/settings/tokens
2. 找到你的 token（通过名称识别，如 `Taku UI CLI`）
3. 查看 token 右侧是否有组织图标
   - 如果有组织图标（如 `Taku-OS`），说明需要授权
   - 点击组织图标 → 点击 "Grant" 授权

### 方法 2: 通过组织设置查找

1. 访问组织设置：
   ```
   https://github.com/organizations/Taku-OS/settings
   ```
2. 左侧菜单 → **Third-party access**（第三方访问）
3. 查看 **Personal access tokens** 部分
4. 如果有待授权的 token，会显示在这里
5. 点击 "Approve" 批准

### 方法 3: 生成 Token 时的提示

1. 生成 token 后，GitHub 可能会显示一个横幅：
   ```
   ⚠️ Some organizations require approval for this token
   ```
2. 点击横幅中的链接
3. 选择组织 `Taku-OS`
4. 点击 "Approve"

### 方法 4: 如果组织启用了 SSO

1. 访问：https://github.com/settings/tokens
2. 找到你的 token
3. 在 token 右侧，如果有 "Configure SSO" 或 "配置 SSO" 按钮
4. 点击按钮
5. 选择组织 `Taku-OS`
6. 点击 "Authorize"

## 💡 为什么可能看不到组织授权？

### 情况 1: 组织没有启用第三方访问限制

**这是正常的！** 如果组织没有启用严格的第三方访问限制，token 可以直接使用，无需额外授权。

**验证方法**：
- 直接测试 token（使用方法 1）
- 如果测试成功，说明不需要额外授权

### 情况 2: 你是组织所有者或管理员

如果你是 `Taku-OS` 组织的所有者或管理员，可能不需要额外授权。

### 情况 3: 组织策略允许自动授权

某些组织策略允许成员自动授权 token 访问。

## ✅ 推荐测试流程

1. **先测试 token 是否有效**：
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/repos/Taku-OS/taku-ui/contents/registry/index.json?ref=main
   ```

2. **如果返回 401 或 403**：
   - 检查 token 权限
   - 查找组织授权选项

3. **如果返回 404**：
   - 检查文件路径
   - 确认文件已推送

4. **如果返回 JSON 数据**：
   - ✅ Token 有效，可以直接使用！
   - 设置环境变量并测试 CLI

## 🎯 快速检查清单

- [ ] Token 已生成（格式：`ghp_xxxxxxxxxxxx`）
- [ ] Token 有 `repo` 权限
- [ ] 已设置环境变量 `TAKU_UI_GITHUB_TOKEN`
- [ ] 已测试 token 可以访问仓库（curl 或 CLI）
- [ ] 如果测试失败，已检查组织授权

## 📝 如果仍然无法访问

如果测试后仍然无法访问，请提供：
1. 错误信息（完整的 curl 或 CLI 输出）
2. Token 的权限列表
3. 你在组织中的角色（成员/管理员/所有者）

这样我可以帮你进一步诊断问题。

