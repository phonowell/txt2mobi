// vitest for processImages
import { describe, expect, it } from 'vitest'

import {
  mockGlob,
  mockWrite,
  setupProcessorMocks,
} from './processor-test-utils.js'

setupProcessorMocks()

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
