# AGENTS.md

## 1. 项目定位
`cndpaper-web-clipper` 是一个 Chrome/Edge 浏览器扩展 (Manifest V3)，专注于提取当前网页正文，转换为 Markdown 并按本机日期归档保存到用户授权的本地目录。

## 2. 常用命令
```bash
npm run typecheck    # TypeScript 类型检查 (tsc --noEmit)
npm test             # 单元测试 (vitest run)
npm run build        # 生产构建 (Webpack 打包至 dist/ 并生成 zip)
npm run dev          # 开发模式监听构建
```

## 3. 技术栈
- 核心逻辑：TypeScript + Chrome Extension Manifest V3 (File System Access API)
- 正文提取：Defuddle
- 构建工具：Webpack 5 + ts-loader + copy-webpack-plugin + zip-webpack-plugin
- 测试框架：Vitest

## 4. 目录结构与约定
- `src/manifest.json`: Extension Manifest V3 配置文件
- `src/core/`: 核心领域逻辑 (文件系统、日期格式化、Markdown 处理、数据库等)
- `src/popup.ts` / `src/options.ts` / `src/extractor.ts`: 扩展入口文件
- `src/styles.css`: 扩展 UI 样式
- `vitest.config.ts`: 测试配置

## 5. 当前状态与下一步
- 当前状态：v2.0.0 正式版，类型检查与 7 项单元测试全量通过，生产打包正常。
- 下一步：持续优化正文提取能力与保存性能。
