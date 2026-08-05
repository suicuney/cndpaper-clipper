# cndpaper 网页裁剪

一个专注于单一任务的 Chrome/Edge 扩展：提取当前网页正文，转换为 Markdown，并保存到用户授权的本地目录中。

## 保存规则

首次使用时选择一个本地目录。之后扩展会按点击保存时的本机日期自动创建子目录：

```text
选择的目录/
├── 2026-08-03/
│   ├── 网页标题.md
│   └── 网页标题-2.md
└── 2026-08-04/
    └── 另一篇文章.md
```

同名文件默认自动追加序号，避免覆盖已有内容。

## 隐私与权限

- 网页内容只在本机浏览器中处理。
- 扩展只在用户点击图标后读取当前标签页。
- 扩展只能写入用户主动选择并授权的目录。
- 不接入外部模型、统计服务或云端存储。

## 本地开发

```bash
npm install
npm test
npm run typecheck
npm run build
```

在 Chrome 中打开 `chrome://extensions`，启用开发者模式，选择“加载已解压的扩展程序”，然后选择 `dist` 目录。

## 浏览器支持

- Chrome 桌面版
- Edge 桌面版

依赖 File System Access API，不支持 Firefox 和 Safari。

## 许可证

MIT。详情见 [LICENSE](LICENSE)。
