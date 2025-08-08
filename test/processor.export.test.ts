// vitest for processor 导出函数
import { describe, expect, it } from 'vitest'

import { setupProcessorMocks } from './processor-test-utils.js'

setupProcessorMocks()

describe('processor 导出函数', () => {
  it('应导出核心处理方法', async () => {
    const mod = await import('../src/core/processor.js')
    expect(typeof mod.processImages).toBe('function')
    expect(typeof mod.convertToMobi).toBe('function')
    expect(typeof mod.fixEncoding).toBe('function')
  })
})
