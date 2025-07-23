import { beforeEach, describe, expect, it, vi } from 'vitest'

const cleanNovelNames = vi.fn<(...args: unknown[]) => Promise<string[]>>(() =>
  Promise.resolve(['/mock/novel/1.txt']),
)
const fixEncoding = vi.fn<(...args: unknown[]) => Promise<void>>()
const cleanTempDir = vi.fn<(...args: unknown[]) => Promise<void>>()
const glob = vi.fn<(...args: unknown[]) => Promise<string[]>>()
const mobiExists = vi.fn<(...args: unknown[]) => Promise<boolean>>()
const splitText = vi.fn<(...args: unknown[]) => Promise<string[]>>()
const processText = vi.fn<(...args: unknown[]) => Promise<void>>()
const convertToMobi = vi.fn<(...args: unknown[]) => Promise<void>>()
const moveToKindle = vi.fn<(...args: unknown[]) => Promise<void>>()

vi.mock('../utils/file.js', () => ({
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
  fixEncoding,
  splitText,
  processText,
  convertToMobi,
}))

describe('convertNovel 异常与边界', () => {
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
    cleanNovelNames.mockResolvedValue(['/mock/novel/1.txt'])
    glob.mockResolvedValue(['/mock/novel/1.txt'])
    mobiExists.mockResolvedValue(false)
    splitText.mockResolvedValue(['/mock/novel/1-1.txt', '/mock/novel/1-2.txt'])
    processText.mockResolvedValue()
    convertToMobi.mockResolvedValue()
    moveToKindle.mockResolvedValue()
    cleanTempDir.mockResolvedValue()
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
})
