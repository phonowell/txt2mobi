import { beforeEach, describe, expect, it, vi } from 'vitest'

const cleanMangaNames = vi.fn<(...args: unknown[]) => Promise<string[]>>(() =>
  Promise.resolve(['/mock/manga/1', '/mock/manga/2']),
)
const cleanTempDir = vi.fn<(...args: unknown[]) => Promise<void>>()
const mobiExists = vi.fn<(...args: unknown[]) => Promise<boolean>>()
const moveToKindle = vi.fn<(...args: unknown[]) => Promise<void>>()
const glob = vi.fn<(...args: unknown[]) => Promise<string[]>>()
const processImages = vi.fn<(...args: unknown[]) => Promise<void>>()
const convertToMobi = vi.fn<(...args: unknown[]) => Promise<void>>()

vi.mock('../utils/file.js', () => ({
  cleanMangaNames,
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
}))

describe('convertManga', () => {
  beforeEach(() => {
    cleanMangaNames.mockClear()
    cleanTempDir.mockClear()
    glob.mockClear()
    mobiExists.mockClear()
    processImages.mockClear()
    convertToMobi.mockClear()
    moveToKindle.mockClear()
    cleanMangaNames.mockResolvedValue(['/mock/manga/1', '/mock/manga/2'])
    glob.mockResolvedValue(['/mock/manga/1', '/mock/manga/2'])
    mobiExists.mockResolvedValue(false)
    processImages.mockResolvedValue()
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
  })

  it('should handle empty input', async () => {
    cleanMangaNames.mockResolvedValueOnce([])
    glob.mockResolvedValueOnce([])
    mobiExists.mockResolvedValue(false)
    processImages.mockResolvedValue()
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
    const { convertManga } = await import('../src/core/converter.js')
    // @ts-expect-error mock
    const result = await convertManga([])
    expect(result).toBeUndefined()
  })
})
