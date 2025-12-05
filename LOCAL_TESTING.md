# 本地测试 CLI

在发布到 npm 之前，可以使用以下方法在本地测试 CLI。

## 方法 1: 使用 npm link（推荐）

### 步骤 1: 在 CLI 目录中创建链接

```bash
# 进入 CLI 目录
cd /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli

# 确保已构建
pnpm build

# 创建全局链接
npm link
```

### 步骤 2: 在测试项目中使用

```bash
# 进入你的测试项目
cd /Users/ldx/project/Company_Project/taku_test_ui/taku

# 现在可以直接使用 taku-ui 命令
taku-ui init
taku-ui add window-controls
```

### 步骤 3: 取消链接（测试完成后）

```bash
# 在 CLI 目录中
cd /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli
npm unlink -g taku-ui
```

## 方法 2: 直接使用本地构建的版本

### 步骤 1: 构建 CLI

```bash
cd /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli
pnpm build
```

### 步骤 2: 在测试项目中使用

```bash
# 进入测试项目
cd /Users/ldx/project/Company_Project/taku_test_ui/taku

# 直接运行构建后的文件
node /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli/dist/index.js init
node /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli/dist/index.js add window-controls
```

### 步骤 3: 创建别名（可选，更方便）

在 `~/.zshrc` 中添加：

```bash
alias taku-ui-local="node /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli/dist/index.js"
```

然后使用：
```bash
taku-ui-local init
taku-ui-local add window-controls
```

## 方法 3: 使用 pnpm link（如果使用 pnpm）

```bash
# 在 CLI 目录中
cd /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli
pnpm link --global

# 在测试项目中使用
cd /Users/ldx/project/Company_Project/taku_test_ui/taku
taku-ui init
taku-ui add window-controls
```

## 测试完整流程

```bash
# 1. 设置 GitHub Token（如果还没设置）
export TAKU_UI_GITHUB_TOKEN=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

# 2. 进入 CLI 目录并链接
cd /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli
pnpm build
npm link

# 3. 进入测试项目
cd /Users/ldx/project/Company_Project/taku_test_ui/taku

# 4. 初始化（如果还没初始化）
taku-ui init

# 5. 添加组件（测试私有仓库访问）
taku-ui add window-controls
```

## 常见问题

### Q: npm link 后找不到命令？

**A**: 确保 `dist/index.js` 文件存在且可执行：
```bash
ls -la /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli/dist/index.js
chmod +x /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli/dist/index.js
```

### Q: 修改代码后需要重新构建吗？

**A**: 是的，需要重新构建：
```bash
cd /Users/ldx/project/Company_Project/taku_test_ui/taku-ui/packages/cli
pnpm build
```

### Q: 如何查看链接状态？

**A**: 
```bash
npm list -g --depth=0 | grep taku-ui
```

