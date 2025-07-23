// vitest for processText
import { describe, expect, it } from 'vitest'

import {
  mockRead,
  mockWrite,
  setupProcessorMocks,
} from './processor-test-utils.js'

setupProcessorMocks()

describe('processText', () => {
  it.each([
    {
      desc: '内容存在时应写入 html',
      content: 'line1\nline2',
      shouldWrite: true,
    },
    {
      desc: '内容为空时不写入 html',
      content: '',
      shouldWrite: false,
    },
  ])('$desc', async ({ content, shouldWrite }) => {
    mockRead.mockResolvedValueOnce(content)
    const mod = await import('../src/core/processor.js')
    await mod.processText(
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
    if (shouldWrite) expect(mockWrite).toHaveBeenCalled()
    else expect(mockWrite).not.toHaveBeenCalled()
  })
})
