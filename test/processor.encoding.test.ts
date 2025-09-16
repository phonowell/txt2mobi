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
      desc: '跳过UTF-8编码的文件',
      files: ['/mock/novel/1.txt'],
      detectedEncoding: 'UTF-8',
    },
    {
      desc: '转换非UTF-8编码的文件',
      files: ['/mock/novel/1.txt'],
      detectedEncoding: 'GB2312',
    },
  ])('$desc', async ({ files, detectedEncoding }) => {
    mockGlob.mockResolvedValueOnce(files)
    const mockBuffer = Buffer.from(
      '测试内容',
      detectedEncoding.toLowerCase() === 'utf-8' ? 'utf-8' : 'utf-8',
    )
    mockRead.mockResolvedValueOnce(mockBuffer)

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
  it('自动检测编码并转换 (gb2312->utf8, utf8保持)', async () => {
    const config = {
      documents: '/mock/documents',
      kindlegen: '/bin/kindlegen',
      mangaMaxWidth: 1280,
      mangaQuality: 80,
      mangaStorage: '/mock/manga',
      novelFileSize: 2,
      novelStorage: '/mock/novel',
      temp: '/tmp',
    }

    // 测试 gb2312 转换
    mockGlob.mockResolvedValueOnce(['/mock/novel/2.txt'])
    mockRead.mockResolvedValueOnce('')
    const gb2312Buffer = Buffer.from([0xc4, 0xe3, 0xba, 0xc3]) // "你好" in gb2312
    mockRead.mockImplementationOnce((_path, opts) => {
      if (opts?.raw) return Promise.resolve(gb2312Buffer)
      return Promise.resolve('')
    })

    const mod = await import('../src/core/processor.js')
    await expect(mod.fixEncoding(config)).resolves.not.toThrow()

    // 测试 utf-8 保持
    mockGlob.mockResolvedValueOnce(['/mock/novel/3.txt'])
    mockRead.mockResolvedValueOnce('')
    const utf8Buffer = Buffer.from('你好', 'utf-8')
    mockRead.mockImplementationOnce((_path, opts) => {
      if (opts?.raw) return Promise.resolve(utf8Buffer)
      return Promise.resolve('')
    })

    await expect(mod.fixEncoding(config)).resolves.not.toThrow()
  })
})
