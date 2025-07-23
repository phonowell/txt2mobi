// vitest for splitText
import { describe, expect, it } from 'vitest'

import {
  mockRead,
  mockWrite,
  setupProcessorMocks,
} from './processor-test-utils.js'

setupProcessorMocks()

describe('splitText', () => {
  it('应写入分块文件并返回路径', async () => {
    mockRead.mockResolvedValueOnce('a\nb\nc')
    const mod = await import('../src/core/processor.js')
    const result = await mod.splitText(
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
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(3)
    expect(mockWrite).toHaveBeenCalledTimes(3)
  })

  it('无内容时应抛出异常', async () => {
    mockRead.mockResolvedValueOnce('')
    const mod = await import('../src/core/processor.js')
    await expect(
      mod.splitText(
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
      ),
    ).rejects.toThrow()
  })
})
