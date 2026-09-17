// vitest for convertToMobi
import { describe, expect, it } from 'vitest'

import {
  mockExec,
  mockIsExist,
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

describe('convertToMobi', () => {
  it('html 不存在时应抛出异常', async () => {
    mockIsExist.mockResolvedValueOnce(false)
    const mod = await import('../src/core/processor.js')
    await expect(mod.convertToMobi(config, '/mock/a.html')).rejects.toThrow(
      'html source not found',
    )
  })

  it('kindlegen 退出码大于 1 时应抛出异常', async () => {
    mockExec.mockResolvedValueOnce([2, 'kindlegen error', ['kindlegen error']])
    const mod = await import('../src/core/processor.js')
    await expect(mod.convertToMobi(config, '/mock/a.html')).rejects.toThrow(
      'kindlegen failed',
    )
  })

  it('kindlegen 成功但产物缺失时应抛出异常', async () => {
    mockIsExist.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const mod = await import('../src/core/processor.js')
    await expect(mod.convertToMobi(config, '/mock/a.html')).rejects.toThrow(
      'kindlegen failed',
    )
  })

  it('kindlegen 警告（退出码 1）且产物存在时应返回 mobi 路径', async () => {
    mockExec.mockResolvedValueOnce([1, 'warning', ['warning']])
    const mod = await import('../src/core/processor.js')
    const result = await mod.convertToMobi(config, '/mock/a.html')
    expect(result).toBe('/tmp/a.mobi')
  })

  it('转换成功时应返回 mobi 路径', async () => {
    const mod = await import('../src/core/processor.js')
    const result = await mod.convertToMobi(config, '/mock/a.html')
    expect(result).toBe('/tmp/a.mobi')
    expect(mockExec).toHaveBeenCalledWith(
      '"/bin/kindlegen" "/mock/a.html" -c1 -dont_append_source',
    )
  })
})
