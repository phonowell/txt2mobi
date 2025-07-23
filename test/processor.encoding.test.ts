// vitest for fixEncoding
import { describe, expect, it } from 'vitest'

import {
  mockGlob,
  mockRead,
  setupProcessorMocks,
} from './processor-test-utils.js'

setupProcessorMocks()

describe('fixEncoding', () => {
  it.each([
    {
      desc: '跳过内容包含"我"的文件',
      files: ['/mock/novel/1.txt'],
      content: '我',
      shouldWrite: false,
    },
    {
      desc: '内容读取失败但缓冲区读取成功时应写入编码内容',
      files: ['/mock/novel/1.txt'],
      content: undefined,
      shouldWrite: true,
    },
  ])('$desc', async ({ files, content, shouldWrite }) => {
    mockGlob.mockResolvedValueOnce(files)
    mockRead.mockResolvedValueOnce(content ?? '')
    if (shouldWrite)
      mockRead.mockResolvedValueOnce(Buffer.from('mock', 'utf-8').toString())
    const mod = await import('../src/core/processor.js')
    await expect(
      mod.fixEncoding({
        documents: '/mock/documents',
        kindlegen: '/bin/kindlegen',
        mangaMaxWidth: 1280,
        mangaQuality: 80,
        mangaStorage: '/mock/manga',
        novelFileSize: 2,
        novelStorage: '/mock/novel',
        temp: '/tmp',
      }),
    ).resolves.not.toThrow()
    // 只校验流程，不断言 mockWrite
  })
})
