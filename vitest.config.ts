import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fsModuleCache: true,
    // isolate:false 更快但会导致跨文件 vi.mock 污染，不可用
  },
})
