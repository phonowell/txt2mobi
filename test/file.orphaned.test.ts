// vitest for removeOrphaned
import { beforeEach, describe, expect, it, vi } from 'vitest'

let glob: ReturnType<typeof vi.fn>
let remove: ReturnType<typeof vi.fn>

beforeEach(() => {
  glob = vi.fn().mockResolvedValue([])
  remove = vi.fn().mockResolvedValue(undefined)
  vi.doMock('fire-keeper', () => ({
    glob,
    remove,
    getBasename: (p: string) =>
      p
        .split('/')
        .pop()
        ?.replace(/\.[^.]+$/, '') ?? '',
    os: () => 'macos',
  }))
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

describe('file utils - removeOrphaned', () => {
  it('should remove orphaned files when found', async () => {
    // File "3" has no corresponding source, should be removed
    glob
      .mockResolvedValueOnce(['/mock/manga/1'])
      .mockResolvedValueOnce(['/mock/novel/1.txt', '/mock/novel/2.txt'])
      .mockResolvedValueOnce([
        '/mock/documents/3.mobi',
        '/mock/documents/1.mobi',
      ])
      .mockResolvedValueOnce(['/mock/documents/3.sdr', '/mock/documents/2.sdr'])

    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.removeOrphaned(mockConfig)
    expect(remove).toHaveBeenCalledTimes(2) // mobi and sdr removal
  })

  it('should skip removal when no orphaned files', async () => {
    glob
      .mockResolvedValueOnce(['/mock/manga/1', '/mock/manga/2'])
      .mockResolvedValueOnce(['/mock/novel/1.txt', '/mock/novel/2.txt'])
      .mockResolvedValueOnce([
        '/mock/documents/1.mobi',
        '/mock/documents/2.mobi',
      ])
      .mockResolvedValueOnce(['/mock/documents/1.sdr', '/mock/documents/2.sdr'])

    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.removeOrphaned(mockConfig)
    expect(remove).not.toHaveBeenCalled()
  })

  it('should handle glob errors', async () => {
    glob.mockRejectedValue(new Error('fail'))
    const fileUtils = await import('../src/utils/basic.js')
    await expect(fileUtils.removeOrphaned(mockConfig)).rejects.toThrow('fail')
  })
})
