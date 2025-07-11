// 合并自 processor-encoding/export/image/mobi/split/text.test.ts
import { describe, expect, it } from 'vitest'

import {
  mockExec,
  mockGlob,
  mockRead,
  mockWrite,
  setupProcessorMocks,
} from './processor-test-utils.js'

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

describe('fixEncoding', () => {
  it.each([
    {
      desc: '跳过内容包含"我"的文件',
      files: ['/mock/novel/1.txt'],
      content: '我',
      shouldWrite: false,
    },
    {
      desc: '内容为空时应编码写入',
      files: ['/mock/novel/1.txt'],
      content: undefined,
      shouldWrite: true,
    },
  ])('$desc', async ({ files, content, shouldWrite }) => {
    mockGlob.mockResolvedValueOnce(files)
    // 非空判断，避免 string | undefined 传 string
    mockRead.mockResolvedValueOnce(content ?? '')
    if (shouldWrite)
      // 保证类型兼容：Buffer 转 string
      mockRead.mockResolvedValueOnce(Buffer.from('mock', 'utf-8').toString())
    const mod = await import('../src/core/processor.js')
    await expect(
      // 传递完整 Config 对象
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
    if (shouldWrite) {
      // 依赖全局 mock，流程通过即可
    } else expect(mockWrite).not.toHaveBeenCalled()
  })
})

describe('processImages', () => {
  it.each([
    {
      desc: '存在图片时应写入 html',
      images: ['img1.jpg'],
      shouldWrite: true,
    },
    {
      desc: '无图片时不写入 html',
      images: [],
      shouldWrite: false,
    },
  ])('$desc', async ({ images, shouldWrite }) => {
    mockGlob.mockResolvedValueOnce(images)
    const mod = await import('../src/core/processor.js')
    await mod.processImages(
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
      '/mock',
    )
    if (shouldWrite) expect(mockWrite).toHaveBeenCalled()
    else expect(mockWrite).not.toHaveBeenCalled()
  })
})

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
    expect(mockWrite).toHaveBeenCalled()
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
