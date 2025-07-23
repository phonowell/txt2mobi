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
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanMangaNames(mockConfig)
    const { exec } = await import('fire-keeper')
    expect(exec).toHaveBeenCalled()
  })

  it('should skip already clean names', async () => {
    glob.mockResolvedValue(['/mock/manga/clean'])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanMangaNames(mockConfig)
    const { exec } = await import('fire-keeper')
    expect(exec).not.toHaveBeenCalled()
  })

  it('should handle empty manga directory', async () => {
    glob.mockResolvedValue([])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanMangaNames(mockConfig)
    const { exec } = await import('fire-keeper')
    expect(exec).not.toHaveBeenCalled()
  })

  it('should handle glob throwing error', async () => {
    glob.mockRejectedValue(new Error('fail'))
    const fileUtils = await import('../src/utils/basic.js')
    await expect(fileUtils.cleanMangaNames(mockConfig)).rejects.toThrow('fail')
  })

  it('should clean reserved characters and limit length', async () => {
    glob.mockResolvedValue([
      '/mock/manga/dirty\\/:*?"<>|',
      `/mock/manga/${'b'.repeat(120)}`,
    ])
    const fileUtils = await import('../src/utils/basic.js')
    await fileUtils.cleanMangaNames(mockConfig)
    const { exec } = await import('fire-keeper')
    const execMock = vi.mocked(exec)
    // 英文保留字符应被移除（允许中文符号）
    const mvMatch =
      typeof execMock.mock.calls[0][0] === 'string'
        ? execMock.mock.calls[0][0].match(/mv ".*\/(.+)" ".*\/(.+)"/)
        : null
    const newName = mvMatch?.[2]
    expect(newName).not.toMatch(/[\\\/:\*\?"<>\|]/)
    expect(newName).toMatch(/[：？]/)
    // 文件名长度应被限制
    const callArg = execMock.mock.calls[1][0]
    const match =
      typeof callArg === 'string'
        ? callArg.match(/mv ".*\/(.+)" ".*\/(.+)"/)
        : null
    expect(match?.[2]?.length).toBeLessThanOrEqual(20)
  })
})
