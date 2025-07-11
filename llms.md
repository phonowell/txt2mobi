llms.md

## 0. 项目目的

- 自动将本地 txt/漫画文件批量转换为 mobi 格式，并同步至 Kindle 设备，支持多平台配置、自动化处理、批量重命名、环境校验、产物清理等流程，提升电子书/漫画管理与推送效率。

## 1. agent维护规则

- 仅保留结构化、机器可解析关键信息，按重要性排序，优先入口、导出、依赖、构建、产物、自动化、测试等
- 自动提取、同步更新，保持准确性和时效性
- 新增、删除、变更需同步更新相关条目，保持格式一致
- 不得遗漏关键模块、脚本、产物、配置、测试等信息
- 文件内容仅面向 LLM/agent，不考虑人类可读性
- agent维护规则模块为最重要的模块，必须放置在文件顶部

## 2. 入口

- src/index.ts

## 3. 导出

- 主程序无显式导出，所有功能在 src/index.ts 主流程内实现

## 4. 模块类型

- ESM (tsconfig.json: module: ESNext, package.json: type: module)

## 5. 依赖

- 运行: fire-keeper, axios, clsx, coffee-ahk, iconv-lite, jimp, radash, web-vitals
- 构建/开发: typescript, tsx, @swc/core, @swc/helpers, @types/node, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, eslint, eslint-config-prettier, eslint-plugin-import, eslint-plugin-prettier, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, eslint-plugin-unused-imports, eslint-plugin-jsx-a11y, eslint-config-react-app, globals, prettier, radash, vitest, ts-morph, unplugin-auto-import, terser

## 6. 目录结构

- src/core/（核心逻辑）
- src/utils/（通用工具）
- src/index.ts（主入口）
- task/（自动化脚本）
- temp/（中间产物、缓存）
- 主要配置与元数据文件：config.yaml, eslint.config.mjs, package.json, pnpm-lock.yaml, tsconfig.json, readme.md, license.md

## 7. 构建与脚本

- lint: eslint "src/**/\*.{ts,tsx}" "task/**/\*.ts" --fix
- start: tsx src/index.ts
- task: tsx task/index.ts
- 产物目录: temp/（中间文件、缓存）

## 8. 配置文件

- tsconfig.json
- eslint.config.mjs
- config.yaml
- pnpm-lock.yaml
- package.json

## 9. 自动化脚本

- task/index.ts (任务入口)
- task/fix-extensions.ts
- task/format.ts
- task/lf.ts
- task/update.ts
- 任务调用: pnpm task <name>

## 10. API自动生成

- 无自动API生成脚本

## 11. 导出内容

- 主程序无显式导出，所有功能在 src/index.ts 主流程内实现

## 12. 全局类型

- 无全局类型声明

## 13. 产物

- 产物目录：temp/（中间文件、缓存等，非最终用户产物）
- 最终产物：无固定导出产物，mobi 文件直接同步至 Kindle 设备（config.yaml: documents 路径）

## 14. 测试规范

- test/ 目录不存在，当前无单测
- ESM规范，全部用例采用 import/await import/vi.mock（如后续添加测试）
- 测试框架统一为 vitest，禁止 jest
- 所有 import 路径必须带文件名后缀（.js/.ts），未遵守视为错误

## 15. 典型调用

- 运行: pnpm start
- 任务: pnpm task <name>

## 16. 单测运行

- 未检测到单测

## 17. 行数规范

- 所有函数文件（.ts/.js/.tsx/.jsx）单文件不得超过90行，超出需拆分

# EOF
