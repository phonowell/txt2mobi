// vitest for processText
import { describe, expect, it } from 'vitest'

import {
  mockRead,
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

describe('processText', () => {
  it('内容存在时应写入 html 并返回目标路径', async () => {
    mockRead.mockResolvedValueOnce('line1\nline2')
    const mod = await import('../src/core/processor.js')
    const result = await mod.processText(config, '/mock/file.txt')

    expect(result).toBe('/tmp/file.html')
    expect(mockWrite).toHaveBeenCalledTimes(1)
  })

  it('空内容时应返回 null 且不写入 html', async () => {
    mockRead.mockResolvedValueOnce('')
    const mod = await import('../src/core/processor.js')
    const result = await mod.processText(config, '/mock/file.txt')

    expect(result).toBeNull()
    expect(mockWrite).not.toHaveBeenCalled()
  })
})
