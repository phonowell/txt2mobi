// vitest for cleanTempDir
import { beforeEach, describe, expect, it, vi } from 'vitest'

let remove: ReturnType<typeof vi.fn>

beforeEach(() => {
  remove = vi.fn()
  vi.doMock('fire-keeper', () => ({
    remove,
    os: () => 'macos',
  }))
  vi.resetModules()
  vi.clearAllMocks()
  remove.mockReset()
  remove.mockResolvedValue(undefined)
})

const mockConfig = {
  mangaStorage: '/mock/manga',
  novelStorage: '/mock/novel',
  documents: '/mock/documents',
  temp: '/mock/temp',
  kindlegen: '/mock/kindlegen',
  mangaMaxWidth: 1280,
  mangaQuality: 80,
  novelFileSize: 200000,
}

describe('file utils - cleanTempDir', () => {
  it('should call remove with temp path', async () => {
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanTempDir(mockConfig)
    expect(remove).toHaveBeenCalledWith(mockConfig.temp)
  })

  it('should handle remove throwing error', async () => {
    remove.mockRejectedValue(new Error('fail'))
    const fileUtils = await import('../src/utils/basic.js')
    await expect(fileUtils.cleanTempDir(mockConfig)).rejects.toThrow()
  })
})
