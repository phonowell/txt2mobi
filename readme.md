# txt2mobi

TypeScript CLI：将小说 `.txt` 与漫画图片目录转换为 `.mobi`，并同步到 `Kindle`。

## English Quick Intro

`txt2mobi` is a TypeScript CLI that converts TXT novels and manga image folders into MOBI, then syncs them to Kindle.

Prerequisites:
- Node.js + pnpm
- A working `kindlegen` binary
- Kindle connected and mounted

Quickstart:
```bash
pnpm install
pnpm build
pnpm start
```

## LLM Friendly Summary

- EN: Convert TXT novels and manga image folders to MOBI, then sync to Kindle documents.
- ZH: 将 TXT 小说与漫画图片目录转换为 MOBI，并自动同步到 Kindle。

## 核心能力

- 小说 TXT 自动编码修复（优先检测并转为 UTF-8）
- 长文本按配置自动分卷，再逐卷转换
- 漫画目录（`.jpg` / `.jpeg` / `.png`）批处理：旋转、缩放、灰度化、内嵌 HTML
- 转换后自动复制到 Kindle `documents` 目录
- 清理无效/孤儿文件，减少设备侧冗余

## 运行前准备

- 已安装 `Node.js` 与 `pnpm`
- 可用的 `kindlegen` 可执行文件路径
- 已连接 Kindle，且能访问其 `documents` 路径

## 快速开始

```bash
pnpm install
pnpm build
pnpm start
```

执行前请先修改根目录 `config.yaml`。

## 配置说明（config.yaml）

- `basic.documents`: Kindle `documents` 路径（支持按平台配置）
- `basic.kindlegen`: `kindlegen` 可执行文件路径（支持按平台配置）
- `manga.storage`: 漫画目录根路径（每个子目录视为一本）
- `manga.maxWidth`: 漫画图最大宽度
- `manga.quality`: 漫画 JPEG 压缩质量
- `novel.storage`: 小说 `.txt` 根路径
- `novel.fileSize`: 小说分卷目标字数

## 典型目录约定

- 漫画：`manga.storage/<book-name>/*.jpg`
- 小说：`novel.storage/*.txt`

## 常用命令

- `pnpm start`: 执行完整转换和同步
- `pnpm build`: 构建 CLI 到 `dist/`
- `pnpm test`: 运行测试
- `pnpm lint`: 运行并修复 lint

## 常见问题

- 提示找不到 `kindlegen`：检查 `config.yaml` 的 `basic.kindlegen` 路径
- 提示找不到 Kindle 路径：确认设备已连接并挂载 `documents`
- 某些 TXT 乱码：工具会尝试自动转码，建议仍以 UTF-8 作为源文件编码

## 关键词

- EN: kindle, mobi, txt-to-mobi, ebook-converter, manga, typescript-cli
- ZH: kindle, mobi, txt转mobi, 电子书转换, 漫画转换, 命令行工具

## 许可证

MIT License。见 `license.md`。

## 联系方式

- Issues: https://github.com/phonowell/txt2mobi/issues
