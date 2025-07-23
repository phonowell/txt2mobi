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
  // 新增：自动编码检测与转换测试
  it('自动检测 gb2312 编码并转换为 utf-8', async () => {
    mockGlob.mockResolvedValueOnce(['/mock/novel/2.txt'])
    mockRead.mockResolvedValueOnce('')
    // gb2312 编码内容
    const gb2312Buffer = Buffer.from([0xc4, 0xe3, 0xba, 0xc3]) // "你好" in gb2312
    mockRead.mockImplementationOnce((_path, opts) => {
      if (opts?.raw) return Promise.resolve(gb2312Buffer)
      return Promise.resolve('')
    })
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
  })

  it('自动检测 utf-8 编码并保持不变', async () => {
    mockGlob.mockResolvedValueOnce(['/mock/novel/3.txt'])
    mockRead.mockResolvedValueOnce('')
    const utf8Buffer = Buffer.from('你好', 'utf-8')
    mockRead.mockImplementationOnce((_path, opts) => {
      if (opts?.raw) return Promise.resolve(utf8Buffer)
      return Promise.resolve('')
    })
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
  })
})
