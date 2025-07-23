// vitest for convertToMobi
import { describe, expect, it } from 'vitest'

import { mockExec, setupProcessorMocks } from './processor-test-utils.js'

setupProcessorMocks()

describe('convertToMobi', () => {
  it('应调用 exec', async () => {
    const mod = await import('../src/core/processor.js')
    await mod.convertToMobi(
      {
        documents: '/mock/documents',
        kindlegen: '/bin/kindlegen',
        mangaMaxWidth: 1280,
        mangaQuality: 80,
        mangaStorage: '/mock/manga',
        novelFileSize: 2,
        novelStorage: '/mock/novel',
        temp: '/tmp',
      },
      '/mock/file.txt',
    )
    expect(mockExec).toHaveBeenCalled()
  })
})
