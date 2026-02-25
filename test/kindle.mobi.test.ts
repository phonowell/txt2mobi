// vitest for mobiExists
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { isExistMock, globMock, copyMock, getBasenameMock, echoMock } =
  vi.hoisted(() => ({
    isExistMock: vi.fn(),
    globMock: vi.fn(),
    copyMock: vi.fn(),
    getBasenameMock: vi.fn(),
    echoMock: vi.fn(),
  }))

vi.mock('fire-keeper', () => ({
  isExist: isExistMock,
  glob: globMock,
  copy: copyMock,
  getBasename: getBasenameMock,
  echo: echoMock,
}))

import type { Config } from '../src/core/config'
import type * as KindleUtils from '../src/utils/kindle.js'

const mockConfig: Config = {
  kindlegen: '/mock/kindlegen',
  documents: '/mock/documents',
  temp: '/mock/temp',
  mangaMaxWidth: 1200,
  mangaQuality: 90,
  mangaStorage: '/mock/manga',
  novelFileSize: 100,
  novelStorage: '/mock/novel',
}

describe('kindle utils - mobiExists', () => {
  let kindleUtils: typeof KindleUtils

  beforeEach(async () => {
    vi.resetModules()
    isExistMock.mockReset()
    globMock.mockReset()
    copyMock.mockReset()
    getBasenameMock.mockReset()
    echoMock.mockReset()
    kindleUtils = await import('../src/utils/kindle.js')
  })

  it('returns false if mobiCache is empty and glob returns no files', async () => {
    globMock.mockResolvedValue([])
    getBasenameMock.mockImplementation((p: string) => p.split('/').pop())
    const result = await kindleUtils.mobiExists(
      mockConfig,
      '/mock/documents/book1.mobi',
    )
    expect(result).toBe(false)
  })

  it('returns true if file exists (direct match or in cache)', async () => {
    globMock.mockResolvedValue([
      '/mock/documents/book1.mobi',
      '/mock/documents/book2.mobi',
    ])
    getBasenameMock.mockImplementation((p: string) => p.split('/').pop())
    // 测试直接匹配
    const result1 = await kindleUtils.mobiExists(
      mockConfig,
      '/mock/documents/book1.mobi',
    )
    expect(result1).toBe(true)

    // 测试缓存机制
    const result2 = await kindleUtils.mobiExists(
      mockConfig,
      '/mock/documents/book2.mobi',
    )
    expect(result2).toBe(true)
    expect(globMock).toHaveBeenCalledTimes(1)
  })

  it('returns false if mobiCache already does not contain the file', async () => {
    globMock.mockResolvedValue(['/mock/documents/book1.mobi'])
    getBasenameMock.mockImplementation((p: string) => p.split('/').pop())
    await kindleUtils.mobiExists(mockConfig, '/mock/documents/book1.mobi')
    const result = await kindleUtils.mobiExists(
      mockConfig,
      '/mock/documents/book3.mobi',
    )
    expect(result).toBe(false)
    expect(globMock).toHaveBeenCalledTimes(1)
  })
})
