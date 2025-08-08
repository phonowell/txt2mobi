import { describe, expect, it, vi } from 'vitest'

vi.mock('../utils/file.js', () => ({
  cleanNovelNames: vi.fn(() => Promise.resolve(['/mock/novel/1.txt'])),
  cleanTempDir: vi.fn(() => Promise.resolve()),
}))
const mobiExists = vi.fn(() => Promise.resolve(true))
const moveToKindle = vi.fn(() => Promise.resolve())
const splitText = vi.fn(() =>
  Promise.resolve(['/mock/novel/1-1.txt', '/mock/novel/1-2.txt']),
)
const processText = vi.fn(() => Promise.resolve())
const convertToMobi = vi.fn(() => Promise.resolve())

vi.mock('../utils/kindle.js', () => ({
  mobiExists,
  moveToKindle,
}))
vi.mock('fire-keeper', () => ({
  glob: vi.fn(() => Promise.resolve(['/mock/novel/1.txt'])),
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
vi.mock('../src/core/processor.js', () => ({
  fixEncoding: vi.fn(() => Promise.resolve()),
  splitText,
  processText,
  convertToMobi,
}))

describe('convertNovel 异常与边界', () => {
  it('should skip files if mobiExists returns true', async () => {
    const { convertNovel } = await import('../src/core/converter.js')

    const config = {
      mangaStorage: '/mock/manga',
      novelStorage: '/mock/novel',
      documents: '/mock/documents',
      temp: '/mock/temp',
      kindlegen: '/mock/kindlegen',
      mangaMaxWidth: 1280,
      mangaQuality: 80,
      novelFileSize: 200000,
    }

    await convertNovel(config)
    expect(splitText).not.toHaveBeenCalled()
    expect(processText).not.toHaveBeenCalled()
    expect(convertToMobi).not.toHaveBeenCalled()
    expect(moveToKindle).not.toHaveBeenCalled()
  })
})
