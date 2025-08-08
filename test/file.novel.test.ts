// vitest for cleanNovelNames
import { beforeEach, describe, expect, it, vi } from 'vitest'

let glob: ReturnType<typeof vi.fn>
let read: ReturnType<typeof vi.fn>
let remove: ReturnType<typeof vi.fn>
let write: ReturnType<typeof vi.fn>

beforeEach(() => {
  glob = vi.fn().mockResolvedValue([])
  read = vi.fn().mockResolvedValue('mock content')
  remove = vi.fn().mockResolvedValue(undefined)
  write = vi.fn()
  vi.doMock('fire-keeper', () => ({
    glob,
    getBasename: (p: string) =>
      p
        .split('/')
        .pop()
        ?.replace(/\.[^.]+$/, '') ?? '',
    read,
    remove,
    write,
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

describe('file utils - cleanNovelNames', () => {
  it('should rename dirty files and skip clean ones', async () => {
    glob.mockResolvedValue([
      '/mock/novel/dirty[1].txt',
      '/mock/novel/clean.txt',
    ])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)
    expect(read).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledTimes(1)
    expect(write).toHaveBeenCalledTimes(1)
  })

  it('should handle empty directory and errors', async () => {
    // Test empty directory
    glob.mockResolvedValue([])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)
    expect(read).not.toHaveBeenCalled()

    // Test glob error
    glob.mockRejectedValue(new Error('fail'))
    await expect(fileUtils.cleanNovelNames(mockConfig)).rejects.toThrow('fail')
  })

  it('should clean reserved characters and limit length', async () => {
    glob.mockResolvedValue([
      '/mock/novel/dirty\\/:*?"<>|.txt',
      `/mock/novel/${'a'.repeat(120)}.txt`,
    ])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)

    const newName = write.mock.calls[0][0].split('/').pop()
    expect(newName).not.toMatch(/[\\\/:\*\?"<>\|]/)
    expect(newName).toMatch(/[：？]/)

    const longName = write.mock.calls[1][0].split('/').pop()
    const baseName = longName.replace(/\.txt$/, '')
    expect(baseName.length).toBeLessThanOrEqual(20)
  })
})
