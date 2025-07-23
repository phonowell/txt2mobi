// vitest for mobiExists
import { beforeEach, describe, expect, it, vi } from 'vitest'

globalThis.isExistMock = vi.fn()
globalThis.globMock = vi.fn()
globalThis.copyMock = vi.fn()
globalThis.getBasenameMock = vi.fn()
globalThis.echoMock = vi.fn()

vi.mock('fire-keeper', () => ({
  isExist: (...args: unknown[]) => globalThis.isExistMock(...args),
  glob: (...args: unknown[]) => globalThis.globMock(...args),
  copy: (...args: unknown[]) => globalThis.copyMock(...args),
  getBasename: (...args: unknown[]) => globalThis.getBasenameMock(...args),
  echo: (...args: unknown[]) => globalThis.echoMock(...args),
}))

import type { Config } from '../src/core/config'

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
  let kindleUtils: typeof import('../src/utils/kindle.js')

  beforeEach(async () => {
    vi.resetModules()
    globalThis.isExistMock.mockReset()
    globalThis.globMock.mockReset()
    globalThis.copyMock.mockReset()
    globalThis.getBasenameMock.mockReset()
    globalThis.echoMock.mockReset()
    kindleUtils = await import('../src/utils/kindle.js')
  })

  it('returns false if mobiCache is empty and glob returns no files', async () => {
    globalThis.globMock.mockResolvedValue([])
    globalThis.getBasenameMock.mockImplementation((p: string) =>
      p.split('/').pop(),
    )
    const result = await kindleUtils.mobiExists(
      mockConfig,
      '/mock/documents/book1.mobi',
    )
    expect(result).toBe(false)
  })

  it('returns true if mobiCache is empty and glob returns matching file', async () => {
    globalThis.globMock.mockResolvedValue(['/mock/documents/book1.mobi'])
    globalThis.getBasenameMock.mockImplementation((p: string) =>
      p.split('/').pop(),
    )
    const result = await kindleUtils.mobiExists(
      mockConfig,
      '/mock/documents/book1.mobi',
    )
    expect(result).toBe(true)
  })

  it('returns true if mobiCache already contains the file', async () => {
    globalThis.globMock.mockResolvedValue([
      '/mock/documents/book1.mobi',
      '/mock/documents/book2.mobi',
    ])
    globalThis.getBasenameMock.mockImplementation((p: string) =>
      p.split('/').pop(),
    )
    await kindleUtils.mobiExists(mockConfig, '/mock/documents/book1.mobi')
    const result = await kindleUtils.mobiExists(
      mockConfig,
      '/mock/documents/book2.mobi',
    )
    expect(result).toBe(true)
    expect(globalThis.globMock).toHaveBeenCalledTimes(1)
  })

  it('returns false if mobiCache already does not contain the file', async () => {
    globalThis.globMock.mockResolvedValue(['/mock/documents/book1.mobi'])
    globalThis.getBasenameMock.mockImplementation((p: string) =>
      p.split('/').pop(),
    )
    await kindleUtils.mobiExists(mockConfig, '/mock/documents/book1.mobi')
    const result = await kindleUtils.mobiExists(
      mockConfig,
      '/mock/documents/book3.mobi',
    )
    expect(result).toBe(false)
    expect(globalThis.globMock).toHaveBeenCalledTimes(1)
  })
})
