// vitest for processor 导出函数
import { describe, expect, it } from 'vitest'

import { setupProcessorMocks } from './processor-test-utils.js'

setupProcessorMocks()

describe('processor 导出函数', () => {
  it('应导出全部核心方法', async () => {
    const mod = await import('../src/core/processor.js')
    expect(typeof mod).toBe('object')
    expect(typeof mod.processImages).toBe('function')
    expect(typeof mod.processText).toBe('function')
    expect(typeof mod.convertToMobi).toBe('function')
    expect(typeof mod.splitText).toBe('function')
    expect(typeof mod.fixEncoding).toBe('function')
  })
})
