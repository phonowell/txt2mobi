// vitest for removeOrphaned
import { beforeEach, describe, expect, it, vi } from 'vitest'

let glob: ReturnType<typeof vi.fn>
let remove: ReturnType<typeof vi.fn>
let getBasename: (p: string) => string

beforeEach(() => {
  glob = vi.fn()
  remove = vi.fn()
  getBasename = (p: string) =>
    p
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '') ?? ''
  vi.doMock('fire-keeper', () => ({
    glob,
    remove,
    getBasename,
    os: () => 'macos',
  }))
  vi.resetModules()
  vi.clearAllMocks()
  glob.mockReset()
  glob.mockResolvedValue([])
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

describe('file utils - removeOrphaned', () => {
  it('should remove orphaned mobi and sdr files', async () => {
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
    expect(remove).toHaveBeenCalled()
  })

  it('should not remove if no orphaned files', async () => {
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

  it('should handle glob throwing error', async () => {
    glob.mockRejectedValue(new Error('fail'))
    const fileUtils = await import('../src/utils/basic.js')
    await expect(fileUtils.removeOrphaned(mockConfig)).rejects.toThrow('fail')
  })
})
