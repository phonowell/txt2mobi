# 发布新版本 Changelog 自动生成 Prompt

请根据以下步骤自动生成新版 Changelog：

1. 获取上一个版本的 tag（如 v0.0.88），并列出自该 tag 以来的所有提交记录。
2. 对每条提交进行归纳整理，合并相似内容，去除无关或重复项。
3. 用简洁、专业的中文总结每一项变更，突出功能新增、优化、修复、依赖升级、测试完善等。
4. 按如下格式输出：

### 0.0.xx @ yyyy-mm-dd

- 变更1
- 变更2
- ...

5. 直接插入到 changelog 文件顶部。

示例：

### 0.0.89 @ 2025-07-09

- 升级 TypeScript 至 ^5.8.3，增强 ~getImageDataUrl~ 方法的测试覆盖率
- 新增和完善多项工具函数的单元测试，覆盖如 ~getRemoteJson~、~hideOverlay~、~insertScript~、~isPictureSupported~、~omit~、~post~、~pxToRem~、~remToPx~、~run~、~scrollToElement~、~scrollTop~、~sendStat~、~setRem~、~showOverlay~、~showToast~、~sleep~、~toBigIntString~、~toDate~、~toString~ 等
- 配置并启用 Vitest 测试框架，支持 jsdom 和全局变量，完善 TypeScript 配置
- 优化和调整依赖项，提升部分功能和性能
- 新增 LLM/Agent 项目结构化摘要，便于自动化工具解析和维护

---

可根据实际需求调整输出内容。
