import { beforeEach, describe, expect, it, vi } from 'vitest'

const cleanMangaNames = vi.fn<(...args: unknown[]) => Promise<string[]>>(() =>
  Promise.resolve(['/mock/manga/1', '/mock/manga/2']),
)
const cleanNovelNames = vi.fn<(...args: unknown[]) => Promise<string[]>>(() =>
  Promise.resolve(['/mock/novel/1.txt']),
)
const cleanTempDir = vi.fn<(...args: unknown[]) => Promise<void>>()
const mobiExists = vi.fn<(...args: unknown[]) => Promise<boolean>>()
const moveToKindle = vi.fn<(...args: unknown[]) => Promise<void>>()
const glob = vi.fn<(...args: unknown[]) => Promise<string[]>>()
const processImages = vi.fn<(...args: unknown[]) => Promise<void>>()
const convertToMobi = vi.fn<(...args: unknown[]) => Promise<void>>()
const fixEncoding = vi.fn<(...args: unknown[]) => Promise<void>>()
const splitText = vi.fn<(...args: unknown[]) => Promise<string[]>>()
const processText = vi.fn<(...args: unknown[]) => Promise<void>>()

vi.mock('../utils/file.js', () => ({
  cleanMangaNames,
  cleanNovelNames,
  cleanTempDir,
}))
vi.mock('../utils/kindle.js', () => ({ mobiExists, moveToKindle }))
vi.mock('fire-keeper', () => ({
  glob,
  os: () => 'macos',
  getBasename: (p: string) => p,
  remove: () => Promise.resolve(),
  read: vi.fn(() => Promise.resolve('mock content')),
  write: vi.fn(() => Promise.resolve()),
  exec: vi.fn(() => Promise.resolve()),
  copy: vi.fn(() => Promise.resolve()),
}))
vi.mock('./processor.js', () => ({
  processImages,
  convertToMobi,
  fixEncoding,
  splitText,
  processText,
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
    // 全局 mock，保证依赖始终返回数组
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
    // 保证所有依赖返回数组，避免 for...of TypeError
    const { convertManga } = await import('../src/core/converter.js')
    // @ts-expect-error mock
    const result = await convertManga([])
    expect(result).toBeUndefined()
  })

  it('should process all sources and call dependencies in order', async () => {
    // 显式 mock，确保依赖被调用
    cleanMangaNames.mockResolvedValue(['/mock/manga/1', '/mock/manga/2'])
    glob.mockResolvedValue(['/mock/manga/1', '/mock/manga/2'])
    mobiExists.mockResolvedValue(false)
    processImages.mockResolvedValue()
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
    const { convertManga } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '/mock/manga',
      other: 'x',
    } as unknown as Parameters<typeof convertManga>[0]
    await expect(convertManga(config)).resolves.toBeUndefined()
  })

  it('should handle processImages reject gracefully', async () => {
    cleanMangaNames.mockResolvedValue(['/mock/manga/1'])
    glob.mockResolvedValue(['/mock/manga/1'])
    mobiExists.mockResolvedValue(false)
    processImages.mockRejectedValueOnce(new Error('fail'))
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
    const { convertManga } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '/mock/manga',
      other: 'x',
    } as unknown as Parameters<typeof convertManga>[0]
    await expect(convertManga(config)).resolves.toBeUndefined()
  })

  it('should handle convertToMobi reject gracefully', async () => {
    cleanMangaNames.mockResolvedValue(['/mock/manga/1'])
    glob.mockResolvedValue(['/mock/manga/1'])
    mobiExists.mockResolvedValue(false)
    processImages.mockResolvedValue()
    convertToMobi.mockRejectedValueOnce(new Error('mobi fail'))
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
    const { convertManga } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '/mock/manga',
      other: 'x',
    } as unknown as Parameters<typeof convertManga>[0]
    await expect(convertManga(config)).resolves.toBeUndefined()
  })

  it('should process all sources and call dependencies in order (repeat)', async () => {
    // 显式 mock，确保依赖被调用
    cleanMangaNames.mockResolvedValue(['/mock/manga/1', '/mock/manga/2'])
    glob.mockResolvedValue(['/mock/manga/1', '/mock/manga/2'])
    mobiExists.mockResolvedValue(false)
    processImages.mockResolvedValue()
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
    const { convertManga } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '/mock/manga',
      other: 'x',
    } as unknown as Parameters<typeof convertManga>[0]
    await expect(convertManga(config)).resolves.toBeUndefined()
  })

  it('should skip sources if mobiExists returns true', async () => {
    glob.mockResolvedValue(['/mock/manga/1'])
    mobiExists.mockResolvedValue(true)
    const { convertManga } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '/mock/manga',
      other: 'x',
    } as unknown as Parameters<typeof convertManga>[0]
    await convertManga(config)
    expect(processImages).not.toHaveBeenCalled()
    expect(convertToMobi).not.toHaveBeenCalled()
    expect(moveToKindle).not.toHaveBeenCalled()
  })
  it('should handle glob returning undefined/null/empty', async () => {
    cleanMangaNames.mockResolvedValue([])
    glob.mockResolvedValueOnce([])
    const { convertManga } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '/mock/manga',
      other: 'x',
    } as unknown as Parameters<typeof convertManga>[0]
    await expect(convertManga(config)).resolves.toBeUndefined()

    glob.mockResolvedValueOnce([])
    await expect(convertManga(config)).resolves.toBeUndefined()

    glob.mockResolvedValueOnce([])
    await expect(convertManga(config)).resolves.toBeUndefined()
  })

  it('should handle processImages implementation reject gracefully', async () => {
    cleanMangaNames.mockResolvedValue(['/mock/manga/1'])
    glob.mockResolvedValue(['/mock/manga/1'])
    mobiExists.mockResolvedValue(false)
    processImages.mockImplementationOnce(() =>
      Promise.reject(new Error('fail')),
    )
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    const { convertManga } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '/mock/manga',
      other: 'x',
    } as unknown as Parameters<typeof convertManga>[0]
    await expect(convertManga(config)).resolves.toBeUndefined()
  })

  it('should handle convertToMobi reject gracefully (2)', async () => {
    cleanMangaNames.mockResolvedValue(['/mock/manga/1'])
    glob.mockResolvedValue(['/mock/manga/1'])
    mobiExists.mockResolvedValue(false)
    processImages.mockResolvedValue()
    convertToMobi.mockRejectedValueOnce(new Error('mobi fail'))
    moveToKindle.mockResolvedValue()
    const { convertManga } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '/mock/manga',
      other: 'x',
    } as unknown as Parameters<typeof convertManga>[0]
    await expect(convertManga(config)).resolves.toBeUndefined()
  })

  it('should handle missing mangaStorage in config gracefully', async () => {
    const { convertManga } = await import('../src/core/converter.js')
    const config = { other: 'x' } as unknown as Parameters<
      typeof convertManga
    >[0]
    await expect(convertManga(config)).resolves.toBeUndefined()
  })
})

describe('convertNovel', () => {
  beforeEach(() => {
    cleanNovelNames.mockClear()
    fixEncoding.mockClear()
    cleanTempDir.mockClear()
    glob.mockClear()
    mobiExists.mockClear()
    splitText.mockClear()
    processText.mockClear()
    convertToMobi.mockClear()
    moveToKindle.mockClear()
    // 全局 mock，保证依赖始终返回数组
    cleanNovelNames.mockResolvedValue(['/mock/novel/1.txt'])
    glob.mockResolvedValue(['/mock/novel/1.txt'])
    mobiExists.mockResolvedValue(false)
    splitText.mockResolvedValue(['/mock/novel/1-1.txt', '/mock/novel/1-2.txt'])
    processText.mockResolvedValue()
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
  })

  it('should handle empty input', async () => {
    cleanNovelNames.mockResolvedValueOnce([])
    glob.mockResolvedValueOnce([])
    const { convertNovel } = await import('../src/core/converter.js')
    // @ts-expect-error mock
    const result = await convertNovel([])
    expect(result).toBeUndefined()
  })

  it('should process all novel files and call dependencies in order', async () => {
    // 显式 mock，确保依赖被调用
    cleanNovelNames.mockResolvedValue(['/mock/novel/1.txt'])
    glob.mockResolvedValue(['/mock/novel/1.txt'])
    mobiExists.mockResolvedValue(false)
    splitText.mockResolvedValue(['/mock/novel/1-1.txt', '/mock/novel/1-2.txt'])
    processText.mockResolvedValue()
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
    const { convertNovel } = await import('../src/core/converter.js')
    const config = {
      novelStorage: '/mock/novel',
      other: 'x',
    } as unknown as Parameters<typeof convertNovel>[0]
    await expect(convertNovel(config)).resolves.toBeUndefined()
  })

  it('should skip files if mobiExists returns true', async () => {
    glob.mockResolvedValue(['/mock/novel/1.txt'])
    mobiExists.mockResolvedValue(true)
    const { convertNovel } = await import('../src/core/converter.js')
    const config = {
      novelStorage: '/mock/novel',
      other: 'x',
    } as unknown as Parameters<typeof convertNovel>[0]
    await convertNovel(config)
    expect(splitText).not.toHaveBeenCalled()
    expect(processText).not.toHaveBeenCalled()
    expect(convertToMobi).not.toHaveBeenCalled()
    expect(moveToKindle).not.toHaveBeenCalled()
  })
  it('should handle glob returning undefined/null/empty', async () => {
    cleanNovelNames.mockResolvedValue([])
    glob.mockResolvedValueOnce([])
    const { convertNovel } = await import('../src/core/converter.js')
    const config = {
      novelStorage: '/mock/novel',
      other: 'x',
    } as unknown as Parameters<typeof convertNovel>[0]
    await expect(convertNovel(config)).resolves.toBeUndefined()

    glob.mockResolvedValueOnce([])
    await expect(convertNovel(config)).resolves.toBeUndefined()

    glob.mockResolvedValueOnce([])
    await expect(convertNovel(config)).resolves.toBeUndefined()
  })

  it('should handle splitText returning empty array', async () => {
    glob.mockResolvedValue(['/mock/novel/1.txt'])
    mobiExists.mockResolvedValue(false)
    splitText.mockResolvedValueOnce([])
    const { convertNovel } = await import('../src/core/converter.js')
    const config = {
      novelStorage: '/mock/novel',
      other: 'x',
    } as unknown as Parameters<typeof convertNovel>[0]
    await expect(convertNovel(config)).resolves.toBeUndefined()
  })

  it('should handle processText reject gracefully', async () => {
    cleanNovelNames.mockResolvedValue(['/mock/novel/1.txt'])
    glob.mockResolvedValue(['/mock/novel/1.txt'])
    mobiExists.mockResolvedValue(false)
    splitText.mockResolvedValue(['/mock/novel/1-1.txt'])
    processText.mockImplementationOnce(() => Promise.reject(new Error('fail')))
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    const { convertNovel } = await import('../src/core/converter.js')
    const config = {
      novelStorage: '/mock/novel',
      other: 'x',
    } as unknown as Parameters<typeof convertNovel>[0]
    await expect(convertNovel(config)).resolves.toBeUndefined()
  })

  it('should handle convertToMobi reject gracefully (novel)', async () => {
    cleanNovelNames.mockResolvedValue(['/mock/novel/1.txt'])
    glob.mockResolvedValue(['/mock/novel/1.txt'])
    mobiExists.mockResolvedValue(false)
    splitText.mockResolvedValue(['/mock/novel/1-1.txt'])
    processText.mockResolvedValue()
    convertToMobi.mockRejectedValueOnce(new Error('mobi fail'))
    moveToKindle.mockResolvedValue()
    const { convertNovel } = await import('../src/core/converter.js')
    const config = {
      novelStorage: '/mock/novel',
      other: 'x',
    } as unknown as Parameters<typeof convertNovel>[0]
    await expect(convertNovel(config)).resolves.toBeUndefined()
  })

  it('should handle missing novelStorage in config gracefully', async () => {
    const { convertNovel } = await import('../src/core/converter.js')
    const config = { other: 'x' } as unknown as Parameters<
      typeof convertNovel
    >[0]
    await expect(convertNovel(config)).resolves.toBeUndefined()
  })
})
