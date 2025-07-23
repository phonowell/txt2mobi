import { beforeEach, describe, expect, it, vi } from 'vitest'

const cleanMangaNames = vi.fn<(...args: unknown[]) => Promise<string[]>>(() =>
  Promise.resolve(['/mock/manga/1']),
)
const cleanNovelNames = vi.fn<(...args: unknown[]) => Promise<string[]>>(() =>
  Promise.resolve(['/mock/novel/1.txt']),
)
const cleanTempDir = vi.fn<(...args: unknown[]) => Promise<void>>()
const glob = vi.fn<(...args: unknown[]) => Promise<string[]>>()
const mobiExists = vi.fn<(...args: unknown[]) => Promise<boolean>>()
const processImages = vi.fn<(...args: unknown[]) => Promise<void>>()
const convertToMobi = vi.fn<(...args: unknown[]) => Promise<void>>()
const fixEncoding = vi.fn<(...args: unknown[]) => Promise<void>>()
const splitText = vi.fn<(...args: unknown[]) => Promise<string[]>>()
const processText = vi.fn<(...args: unknown[]) => Promise<void>>()
const moveToKindle = vi.fn<(...args: unknown[]) => Promise<void>>()

vi.mock('../utils/file.js', () => ({
  cleanMangaNames,
  cleanNovelNames,
  cleanTempDir,
}))
vi.mock('../utils/kindle.js', () => ({ mobiExists, moveToKindle }))
vi.mock('fire-keeper', () => ({
  glob,
  os: () => 'macos',
  getBasename: (p: string) => p.split('/').pop() ?? '',
  remove: vi.fn(() => Promise.resolve()),
  read: vi.fn(() => Promise.resolve('mock content')),
  write: vi.fn(() => Promise.resolve()),
  exec: vi.fn(() => Promise.resolve()),
  copy: vi.fn(() => Promise.resolve()),
  isExist: vi.fn(() => Promise.resolve(true)),
  echo: vi.fn(() => void 0),
}))
vi.mock('./processor.js', () => ({
  processImages,
  convertToMobi,
  fixEncoding,
  splitText,
  processText,
}))

describe('convertManga/convertNovel 其他异常', () => {
  beforeEach(() => {
    cleanMangaNames.mockClear()
    cleanNovelNames.mockClear()
    cleanTempDir.mockClear()
    glob.mockClear()
    mobiExists.mockClear()
    processImages.mockClear()
    convertToMobi.mockClear()
    fixEncoding.mockClear()
    splitText.mockClear()
    processText.mockClear()
    moveToKindle.mockClear()
    cleanMangaNames.mockResolvedValue(['/mock/manga/1'])
    cleanNovelNames.mockResolvedValue(['/mock/novel/1.txt'])
    glob.mockResolvedValue(['/mock/manga/1'])
    mobiExists.mockResolvedValue(false)
    processImages.mockResolvedValue()
    convertToMobi.mockResolvedValue()
    fixEncoding.mockResolvedValue()
    splitText.mockResolvedValue(['/mock/novel/1-1.txt'])
    processText.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
  })

  it('should handle missing mangaStorage in config gracefully', async () => {
    const { convertManga } = await import('../src/core/converter.js')
    const config = { other: 'x' } as unknown as Parameters<
      typeof convertManga
    >[0]
    await expect(convertManga(config)).resolves.toBeUndefined()
  })

  it('should handle missing novelStorage in config gracefully', async () => {
    const { convertNovel } = await import('../src/core/converter.js')
    const config = { other: 'x' } as unknown as Parameters<
      typeof convertNovel
    >[0]
    await expect(convertNovel(config)).resolves.toBeUndefined()
  })
})
