# 快速发布指南

## 🚀 三步发布

### 1. 提交 Registry 到 GitHub

```bash
cd /Users/ldx/project/Company_Project/taku_test_ui/taku-ui

# 添加所有更改
git add registry/ packages/cli/src/ *.md

# 提交
git commit -m "feat: publish taku-ui component library

- Add window-controls component
- Add window-control-icons component  
- Support GitHub registry for private repos
- Auto-detect project structure"

# 推送
git push origin main
```

### 2. 验证 Registry

访问：https://raw.githubusercontent.com/Taku-OS/taku-ui/main/registry/index.json

应该能看到组件列表。

### 3. 发布 CLI 到 npm

```bash
cd packages/cli

# 检查包名（如果被占用，需要修改 package.json 中的 name）
npm view taku-ui

# 登录 npm（如果还没登录）
npm login

# 发布
npm publish
```

## ✅ 发布完成！

发布后，其他人可以使用：

```bash
# 初始化项目
npx taku-ui@latest init

# 添加组件
npx taku-ui@latest add window-controls
npx taku-ui@latest add window-control-icons
```

## 🔒 私有仓库用户

如果仓库是私有的，用户需要设置 GitHub Token：

```bash
export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
npx taku-ui@latest add window-controls
```

详细说明见 `PRIVATE_REPO_SETUP.md`。

