// vitest for cleanMangaNames
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Mock } from 'vitest'

let glob: Mock
let exec: Mock

beforeEach(() => {
  glob = vi.fn()
  exec = vi.fn()
  vi.doMock('fire-keeper', () => ({
    glob,
    getBasename: (p: string) =>
      p
        .split('/')
        .pop()
        ?.replace(/\.[^.]+$/, '') ?? '',
    exec,
    os: () => 'macos',
  }))
  vi.resetModules()
  vi.clearAllMocks()
  glob.mockReset()
  glob.mockResolvedValue([])
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

describe('file utils - cleanMangaNames', () => {
  it('should rename directories with dirty names', async () => {
    glob.mockResolvedValue(['/mock/manga/dirty[1]', '/mock/manga/clean'])
    const fileUtils = await import('../src/utils/file.js')
    await fileUtils.cleanMangaNames(mockConfig)
    const { exec } = await import('fire-keeper')
    expect(exec).toHaveBeenCalled()
  })

  it('should skip already clean names', async () => {
    glob.mockResolvedValue(['/mock/manga/clean'])
    const fileUtils = await import('../src/utils/file.js')
    await fileUtils.cleanMangaNames(mockConfig)
    const { exec } = await import('fire-keeper')
    expect(exec).not.toHaveBeenCalled()
  })

  it('should handle empty manga directory', async () => {
    glob.mockResolvedValue([])
    const fileUtils = await import('../src/utils/file.js')
    await fileUtils.cleanMangaNames(mockConfig)
    const { exec } = await import('fire-keeper')
    expect(exec).not.toHaveBeenCalled()
  })

  it('should handle glob throwing error', async () => {
    glob.mockRejectedValue(new Error('fail'))
    const fileUtils = await import('../src/utils/file.js')
    await expect(fileUtils.cleanMangaNames(mockConfig)).rejects.toThrow('fail')
  })
})
