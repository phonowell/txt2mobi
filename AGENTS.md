# AGENTS.md

## 元原则
- 精简冗余 / 最小化实现
- 客观诚实：不编造、不掩盖不确定性、不因情绪改变技术判断
- 仅保留可执行约束；通用解释性内容一律删除

## 关键约束
- `>=3` 步任务必须创建并维护 `plans/task_plan_{suffix}.md`（`plans/` 不入库）
- 优先一次性批量 Edit，避免碎片化小改
- `try-catch` 仅用于高 ROI：边界 I/O、外部依赖、可恢复失败
- 非空断言 `!` 出现 `>=5` 处：优先重构类型，禁止批量压制 lint
- 新增/删除/重命名需同步更新：导出、脚本、测试、相关文档条目
- 源码改动后必须通过：`pnpm lint` + `pnpm test`
- 规则冲突时以当前仓库代码与可执行命令结果为准

## 项目边界
- 这个项目是什么：面向个人本地环境的 TypeScript CLI；读取 `config.yaml`，将小说 `.txt` 与漫画图片目录转换为 `.mobi`，再复制到 Kindle `documents`
- 这个项目不是什么：不是 Web 服务、不是桌面 GUI、不是通用电子书管理器、不是 `kindlegen` 的替代实现、不是以 SDK 为主的库项目
- 这个项目做什么：校验 `kindlegen` 与 Kindle 挂载状态；修复 TXT 编码；按配置分卷；处理漫画图片；生成 HTML 并转换为 `.mobi`；同步产物到 Kindle；清理临时与孤儿文件；TXT 编码修复范围聚焦 UTF-8 与中文常见编码回退（`gb18030` / `gbk` / `gb2312`）
- 这个项目不做什么：不下载或抓取内容；不管理在线书库/账号/元数据；不提供 API、守护进程或持续同步服务；不支持超出 TXT 小说与漫画图片目录之外的通用格式转换；不做通用全编码自动修复；不维护独立的 Kindle 产物清单，孤儿清理默认按当前源目录与 `documents` 下的 `.mobi` / `.sdr` 对账；不在缺少 `kindlegen` 或 Kindle 挂载时伪造成功结果

## 技术栈
- Node.js `>=20` + TypeScript 7（ESM / NodeNext）
- 依赖：`fire-keeper` `chardet` `iconv-lite` `jimp` `radash`
- 测试：`vitest` 5
- 规范：`oxlint` + `oxfmt`（`pnpm lint` 内含 `--fix`）

## 关键约定
- NodeNext ESM：相对导入必须带 `.js` 后缀（`import x from './a.js'`），由 `import/extensions` 强制；`pnpm task fix-extensions` 可批量补全
- 并发：fire-keeper `runConcurrent`（kindlegen 3 / jimp·编码 5），入口 manga 与 novel 两条 pipeline 并行
- 测试：`vi.mock('fire-keeper')` 等按模块边界 mock；公共 mock 在 `test/processor-test-utils.ts`
- `temp/` `plans/` `dist/` `coverage/` 为本地产物，不入库
- `pnpm-workspace.yaml` 的 `allowBuilds` 为供应链策略，改动需用户确认

## 目录结构
- `src/index.ts`：入口
- `src/core/`：处理流程（`processor.images.ts` `processor.text.ts` `processor.mobi.ts` `processor.encoding.ts`，统一由 `processor.ts` 导出）
- `src/utils/` `src/constants/`
- `tasks/`（脚本）`test/`（测试）
- 配置：`config.yaml` `.oxlintrc.json` `.oxfmtrc.json` `vitest.config.ts` `pnpm-workspace.yaml` `tsconfig.json` `.github/workflows/ci.yml`

## 核心命令
- `pnpm start`：`tsx src/index.ts`
- `pnpm task <name>`：`tsx tasks/index.ts`
- `pnpm lint`：`oxlint --fix` + `oxfmt`
- `pnpm test`：`vitest run`
- `pnpm build`：`tsc -p tsconfig.build.json` → `dist/`
- `pnpm coverage`：`vitest run --coverage`

## 工作流
1. 明确目标与影响范围；若 `>=3` 步先建 `plans/task_plan_{suffix}.md`
2. 按最小改动实现；必要时批量更新关联导出/脚本/测试
3. 运行 `pnpm lint`、`pnpm test`；失败先修复再给结果
4. 输出基于事实与命令结果，不做主观评价

## 输出格式
- 禁预告文字；直达结论 + 证据
- 状态用 `✓/✗/→`；错误格式：`✗ {位置}:{类型}`
- 数据优先；`>=2` 条信息用列表
- 路径可缩写：`.` 项目根、`~` 主目录
- 禁总结性重复；命令间不插入无意义文本
