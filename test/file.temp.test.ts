// vitest for cleanTempDir
import { beforeEach, describe, expect, it, vi } from 'vitest'

let remove: ReturnType<typeof vi.fn>

beforeEach(() => {
  remove = vi.fn().mockResolvedValue(undefined)
  vi.doMock('fire-keeper', () => ({ remove, os: () => 'macos' }))
  vi.resetModules()
  vi.clearAllMocks()
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
  it('should remove temp directory and handle errors', async () => {
    const fileUtils = await import('../src/utils/basic.js')

    // Test normal removal
    await fileUtils.cleanTempDir(mockConfig)
    expect(remove).toHaveBeenCalledWith(mockConfig.temp)

    // Test error handling
    remove.mockRejectedValue(new Error('fail'))
    await expect(fileUtils.cleanTempDir(mockConfig)).rejects.toThrow()
  })
})
