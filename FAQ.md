# 常见问题 FAQ

## ❓ 为什么 `npx taku-ui@latest` 需要安装包？

**这是正常的！** 这是 npm/npx 的标准行为。

### npx 的工作原理

当你运行 `npx taku-ui@latest` 时：
1. npx 会临时下载包到缓存目录（`~/.npm/_npx/`）
2. 执行包中的命令
3. 执行完成后，包保留在缓存中（下次使用更快）

### 其他组件库也是这样

- **shadcn/ui**: `npx shadcn-ui@latest` - 也会下载
- **hero-ui**: `npx heroui@latest` - 也会下载
- **magic-ui**: `npx magicui@latest` - 也会下载

你可能没注意到是因为：
- 包很小，下载很快
- 第二次使用时，npx 会使用缓存，不会重新下载

### 如何避免每次下载？

**方式 1: 全局安装**
```bash
npm install -g taku-ui
taku-ui add window-controls
```

**方式 2: 项目依赖**
```bash
npm install -D taku-ui
npx taku-ui add window-controls
```

## ❓ 为什么配置文件读取失败？

如果看到类似错误：
```
Error: Failed to read config file: [{"code":"invalid_type",...}]
```

**原因**：
- 配置文件 `taku-ui.json` 不完整或格式错误
- `init` 命令被中断，配置文件未完成

**解决方案**：

**方案 1: 重新运行 init**
```bash
npx taku-ui@latest init
```

**方案 2: 删除配置文件，让 CLI 自动检测**
```bash
rm taku-ui.json
npx taku-ui@latest add window-controls
```

**方案 3: 手动修复配置文件**
确保 `taku-ui.json` 包含：
```json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
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

## ❓ 为什么 hero-ui/magic-ui 不需要 init？

实际上，**很多组件库都需要 init**：
- **shadcn/ui**: 需要 `npx shadcn-ui@latest init`
- **hero-ui**: 也需要初始化配置
- **magic-ui**: 也需要初始化配置

但我们的 CLI 已经支持**无需 init 直接添加组件**：
```bash
# 不需要先 init，直接添加组件
npx taku-ui@latest add window-controls
```

CLI 会自动检测项目结构并使用默认值。

## ❓ 如何更新已安装的组件？

```bash
# 使用 --overwrite 选项
npx taku-ui@latest add window-controls --overwrite
```

## ❓ 如何查看所有可用组件？

```bash
# 不指定组件名称，会显示选择列表
npx taku-ui@latest add
```

## ❓ 私有仓库用户如何使用？

1. 设置 GitHub Token：
   ```bash
   export TAKU_UI_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
   ```

2. 使用 CLI：
   ```bash
   npx taku-ui@latest add window-controls
   ```

详细说明见 `PRIVATE_REPO_SETUP.md`。

## ❓ 如何自定义 Registry URL？

**方式 1: 环境变量**
```bash
export TAKU_UI_REGISTRY_URL=https://raw.githubusercontent.com/your-org/repo/main/registry
npx taku-ui@latest add window-controls
```

**方式 2: 配置文件**
在 `taku-ui.json` 中添加：
```json
{
  "registryUrl": "https://raw.githubusercontent.com/your-org/repo/main/registry"
}
```

