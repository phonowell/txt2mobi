import { beforeEach, describe, expect, it, vi } from 'vitest'

const glob = vi.fn()
const isExist = vi.fn()
const rename = vi.fn()

vi.mock('fire-keeper', () => ({
  glob,
  getBasename: (p: string) =>
    p
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '') ?? '',
  isExist,
  rename,
}))

beforeEach(() => {
  vi.clearAllMocks()
  glob.mockResolvedValue([])
  isExist.mockResolvedValue(false)
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
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanMangaNames(mockConfig)
    expect(rename).toHaveBeenCalledWith('/mock/manga/dirty[1]', 'dirty', {
      echo: false,
    })
  })

  it('should skip already clean names', async () => {
    glob.mockResolvedValue(['/mock/manga/clean'])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanMangaNames(mockConfig)
    expect(rename).not.toHaveBeenCalled()
  })

  it('should handle empty manga directory', async () => {
    glob.mockResolvedValue([])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanMangaNames(mockConfig)
    expect(rename).not.toHaveBeenCalled()
  })

  it('should handle glob throwing error', async () => {
    glob.mockRejectedValue(new Error('fail'))
    const fileUtils = await import('../src/utils/basic.js')
    await expect(fileUtils.cleanMangaNames(mockConfig)).rejects.toThrow('fail')
  })

  it('should clean reserved characters and limit length', async () => {
    glob.mockResolvedValue([
      '/mock/manga/dirty\\/:*?"<>|',
      `/mock/manga/${'b'.repeat(140)}`,
    ])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanMangaNames(mockConfig)

    const newName = rename.mock.calls[0][1]
    expect(newName).not.toMatch(/[\\\/:\*\?"<>\|]/)
    expect(rename.mock.calls[1][1].length).toBeLessThanOrEqual(120)
  })

  it('should avoid collisions by appending a numeric suffix', async () => {
    glob.mockResolvedValue(['/mock/manga/[番外]', '/mock/manga/番外'])
    isExist.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanMangaNames(mockConfig)

    expect(rename).toHaveBeenCalledWith('/mock/manga/[番外]', 'untitled 2', {
      echo: false,
    })
    expect(rename).not.toHaveBeenCalledWith('/mock/manga/番外', '番外', {
      echo: false,
    })
  })
})
