// vitest for processImages
import { describe, expect, it } from 'vitest'

import {
  mockGlob,
  mockWrite,
  setupProcessorMocks,
} from './processor-test-utils.js'

setupProcessorMocks()

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

describe('processImages', () => {
  it('存在支持的图片格式时应写入 html 并返回目标路径', async () => {
    mockGlob
      .mockResolvedValueOnce(['img1.jpg'])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['img2.JPEG'])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    const mod = await import('../src/core/processor.js')
    const result = await mod.processImages(config, '/mock')

    expect(result).toBe('/tmp/mock.html')
    expect(mockWrite).toHaveBeenCalledTimes(1)
  })

  it('无图片时应返回 null 且不写入 html', async () => {
    mockGlob.mockResolvedValue([])
    const mod = await import('../src/core/processor.js')
    const result = await mod.processImages(config, '/mock')

    expect(result).toBeNull()
    expect(mockWrite).not.toHaveBeenCalled()
  })
})
