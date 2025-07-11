// vitest test for src/utils/kindle.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

declare global {
  var isExistMock: ReturnType<typeof vi.fn>

  var globMock: ReturnType<typeof vi.fn>

  var copyMock: ReturnType<typeof vi.fn>

  var getBasenameMock: ReturnType<typeof vi.fn>

  var echoMock: ReturnType<typeof vi.fn>
}

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

describe('kindle utils', () => {
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

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('validateEnv', () => {
    it('returns false and echoes if kindlegen does not exist', async () => {
      globalThis.isExistMock.mockResolvedValueOnce(false)
      const result = await kindleUtils.validateEnv(mockConfig)
      expect(result).toBe(false)
      expect(globalThis.echoMock).toHaveBeenCalledWith(
        "found no 'kindlegen', run 'brew cask install kindlegen' to install it",
      )
    })

    it('returns false and echoes if documents does not exist', async () => {
      globalThis.isExistMock
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
      const result = await kindleUtils.validateEnv(mockConfig)
      expect(result).toBe(false)
      expect(globalThis.echoMock).toHaveBeenCalledWith(
        "found no '/mock/documents', kindle must be connected",
      )
    })

    it('returns true if both kindlegen and documents exist', async () => {
      globalThis.isExistMock.mockResolvedValue(true)
      const result = await kindleUtils.validateEnv(mockConfig)
      expect(result).toBe(true)
    })
  })

  describe('mobiExists', () => {
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
      // prime cache by first call
      globalThis.globMock.mockResolvedValue([
        '/mock/documents/book1.mobi',
        '/mock/documents/book2.mobi',
      ])
      globalThis.getBasenameMock.mockImplementation((p: string) =>
        p.split('/').pop(),
      )
      await kindleUtils.mobiExists(
        mockConfig,
        '/mock/documents/book1.mobi',
      )
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
      await kindleUtils.mobiExists(
        mockConfig,
        '/mock/documents/book1.mobi',
      )
      const result = await kindleUtils.mobiExists(
        mockConfig,
        '/mock/documents/book3.mobi',
      )
      expect(result).toBe(false)
      expect(globalThis.globMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('moveToKindle', () => {
    it('calls copy with correct arguments', async () => {
      globalThis.getBasenameMock.mockImplementation(() => 'book1')
      await kindleUtils.moveToKindle(
        mockConfig,
        '/mock/documents/book1.mobi',
      )
      expect(globalThis.copyMock).toHaveBeenCalledWith(
        '/mock/temp/book1.mobi',
        '/mock/documents',
      )
    })
  })
})
