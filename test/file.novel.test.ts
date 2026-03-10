// vitest for cleanNovelNames
import { beforeEach, describe, expect, it, vi } from 'vitest'

let glob: ReturnType<typeof vi.fn>
let isExist: ReturnType<typeof vi.fn>
let rename: ReturnType<typeof vi.fn>

beforeEach(() => {
  glob = vi.fn().mockResolvedValue([])
  isExist = vi.fn().mockResolvedValue(false)
  rename = vi.fn().mockResolvedValue(undefined)
  vi.doMock('fire-keeper', () => ({
    glob,
    getBasename: (p: string) =>
      p
        .split('/')
        .pop()
        ?.replace(/\.[^.]+$/, '') ?? '',
    isExist,
    rename,
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
    expect(rename).toHaveBeenCalledTimes(1)
    expect(rename).toHaveBeenCalledWith(
      '/mock/novel/dirty[1].txt',
      'dirty.txt',
      { echo: false },
    )
  })

  it('should handle empty directory and errors', async () => {
    // Test empty directory
    glob.mockResolvedValue([])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)
    expect(rename).not.toHaveBeenCalled()

    // Test glob error
    glob.mockRejectedValue(new Error('fail'))
    await expect(fileUtils.cleanNovelNames(mockConfig)).rejects.toThrow('fail')
  })

  it('should clean reserved characters and limit length', async () => {
    glob.mockResolvedValue([
      '/mock/novel/dirty\\/:*?"<>|.txt',
      `/mock/novel/${'a'.repeat(140)}.txt`,
    ])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)

    const newName = rename.mock.calls[0][1]
    expect(newName).not.toMatch(/[\\\/:\*\?"<>\|]/)
    expect(newName).toMatch(/\.txt$/)

    const longName = rename.mock.calls[1][1]
    const baseName = longName.replace(/\.txt$/, '')
    expect(baseName.length).toBeLessThanOrEqual(120)
  })

  it('should not append duplicated txt extension', async () => {
    glob.mockResolvedValue(['/mock/novel/[番外]测试书.txt'])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)

    const targetName = rename.mock.calls[0][1]
    expect(targetName).toBe('测试书.txt')
  })

  it('should avoid collisions by appending a numeric suffix', async () => {
    glob.mockResolvedValue(['/mock/novel/[番外].txt'])
    isExist.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)

    expect(rename).toHaveBeenCalledWith(
      '/mock/novel/[番外].txt',
      'untitled 2.txt',
      { echo: false },
    )
  })
})
