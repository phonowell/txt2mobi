llms.md

**最后更新：2025年09月17日**
**状态：✅ 所有测试通过 (39/39)，ESLint 检查通过，依赖信息已同步**

## 0. 项目目的

- 自动将本地 txt/漫画文件批量转换为 mobi 格式，并同步至 Kindle 设备，支持多平台配置、自动化处理、批量重命名、环境校验、产物清理等流程，提升电子书/漫画管理与推送效率。

## 1. agent维护规则

- 源码每次变更后，**必须执行全部测试用例，确保所有新旧逻辑均被充分覆盖，测试全部通过后方可提交**
- 所有新增或修改的代码**必须严格遵循 eslint.config.mjs 中的规范，提交前必须通过所有 ESLint 检查，禁止有任何风格错误或警告**
- **总是最小化实现代码，避免冗余逻辑和过度设计**
- **总是使用 eslint cli 来修复代码格式，确保一致性**
- **总是尽可能为用户省去无谓输出，节省 tokens 和时间**
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

- 仅保留关键依赖：fire-keeper, chardet, iconv-lite, jimp, vitest

## 6. 目录结构

- src/core/（核心逻辑，已拆分为 processor.images.ts、processor.text.ts、processor.mobi.ts、processor.encoding.ts，主入口 processor.ts 统一导出）
- src/utils/（通用工具）
- src/index.ts（主入口）
- task/（自动化脚本）
- temp/（中间产物、缓存）
- 主要配置与元数据文件：config.yaml, eslint.config.mjs, package.json, pnpm-lock.yaml, tsconfig.json, readme.md, license.md

## 7. 构建与脚本

- 仅保留主入口脚本：start: tsx src/index.ts
- 任务入口：task: tsx task/index.ts
- 代码检查：lint: eslint "src/**/\*.{ts,tsx}" "{task,test}/**/\*.ts" --fix
- 测试运行：test: vitest run

## 8. 配置文件

- 保留关键配置文件：tsconfig.json, config.yaml, package.json

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

- mobi 文件直接同步至 Kindle 设备（config.yaml: documents 路径）

## 14. 测试规范

- test/ 目录存在，已覆盖以下核心功能模块：
  - 配置加载与平台兼容（config.basic.test.ts, config.platform.test.ts）
  - 文件名清理与异常（file.manga.test.ts, file.novel.test.ts, file.orphaned.test.ts）
    - cleanName 规则已覆盖所有平台保留字符过滤与文件名长度限制（最大 20 字符）
    - 测试用例已补充保留字符、超长文件名等边界与异常场景
  - 临时目录清理（file.temp.test.ts）
  - Kindle 工具与推送（kindle.env.test.ts, kindle.mobi.test.ts, kindle.move.test.ts）
  - 处理器接口与功能（processor.export.test.ts, processor.images.test.ts, processor.mobi.test.ts, processor.split.test.ts, processor.text.test.ts, processor.encoding.test.ts）
  - manga/novel 转换流程与异常（converter.manga.test.ts, converter.manga.error.test.ts, converter.misc.test.ts）
- 用例均采用 ESM 规范，全部使用 import/await import/vi.mock
- 测试框架统一为 vitest，禁止 jest
- 所有 ESM import 路径必须带文件名后缀，且仅允许使用 .js/.jsx，禁止使用 .ts/.tsx 后缀，未遵守视为错误
- 用例覆盖全面，结构合理，无明显冗余或重复，建议持续补充边界场景

## 15. 典型调用

- 运行转换：pnpm start
- 任务管理：pnpm task <name>
- 代码检查：pnpm run lint
- 测试运行：pnpm test

## 16. 单测运行

- test/ 目录下所有用例可通过 pnpm test 或 vitest 统一运行
- 已检测到 19 个单测文件，覆盖所有核心功能模块及异常场景
- 覆盖率报告获取：**必须使用 `npx vitest --coverage --run` 获取覆盖率报告，确保所有核心逻辑和工具函数均有充分测试。**

# EOF
