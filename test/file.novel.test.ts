// vitest for cleanNovelNames
import { beforeEach, describe, expect, it, vi } from 'vitest'

let glob: ReturnType<typeof vi.fn>
let read: ReturnType<typeof vi.fn>
let remove: ReturnType<typeof vi.fn>
let write: ReturnType<typeof vi.fn>

beforeEach(() => {
  glob = vi.fn()
  read = vi.fn(() => Promise.resolve('mock content'))
  remove = vi.fn()
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

describe('file utils - cleanNovelNames', () => {
  it('should rename files with dirty names', async () => {
    glob.mockResolvedValue(['/mock/novel/dirty[1].txt'])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)
    const { read, remove, write } = await import('fire-keeper')
    expect(read).toHaveBeenCalled()
    expect(remove).toHaveBeenCalled()
    expect(write).toHaveBeenCalled()
  })

  it('should skip already clean names', async () => {
    glob.mockResolvedValue(['/mock/novel/clean.txt'])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)
    const { read, remove, write } = await import('fire-keeper')
    expect(read).not.toHaveBeenCalled()
    expect(remove).not.toHaveBeenCalled()
    expect(write).not.toHaveBeenCalled()
  })

  it('should handle empty novel directory', async () => {
    glob.mockResolvedValue([])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)
    const { read, remove, write } = await import('fire-keeper')
    expect(read).not.toHaveBeenCalled()
    expect(remove).not.toHaveBeenCalled()
    expect(write).not.toHaveBeenCalled()
  })

  it('should handle glob throwing error', async () => {
    glob.mockRejectedValue(new Error('fail'))
    const fileUtils = await import('../src/utils/basic.js')
    await expect(fileUtils.cleanNovelNames(mockConfig)).rejects.toThrow('fail')
  })

  it('should clean reserved characters and limit length', async () => {
    glob.mockResolvedValue([
      '/mock/novel/dirty\\/:*?"<>|.txt',
      `/mock/novel/${'a'.repeat(120)}.txt`,
    ])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanNovelNames(mockConfig)
    // 英文保留字符应被移除（允许中文符号）
    const newName = write.mock.calls[0][0].split('/').pop()
    expect(newName).not.toMatch(/[\\\/:\*\?"<>\|]/)
    expect(newName).toMatch(/[：？]/)
    // 文件名长度应被限制
    const longName = write.mock.calls[1][0].split('/').pop()
    const baseName = longName.replace(/\.txt$/, '')
    expect(baseName.length).toBeLessThanOrEqual(20)
  })
})
