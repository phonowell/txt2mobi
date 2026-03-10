import { describe, expect, it, vi } from 'vitest'

const fixEncoding = vi.fn(() => Promise.resolve())
const splitText = vi.fn(() =>
  Promise.resolve(['/mock/novel/1-1.txt', '/mock/novel/1-2.txt']),
)
const processText = vi.fn((_, filePath: string) =>
  Promise.resolve(filePath.replace('.txt', '.html')),
)
const convertToMobi = vi.fn((config, htmlPath: string) =>
  Promise.resolve(
    `${config.temp}/${htmlPath.split('/').pop()?.replace('.html', '.mobi')}`,
  ),
)
const mobiExists = vi.fn(() => Promise.resolve(false))
const moveToKindle = vi.fn(() => Promise.resolve())

vi.mock('../src/utils/file.js', () => ({
  cleanNovelNames: vi.fn(() => Promise.resolve([])),
  cleanTempDir: vi.fn(() => Promise.resolve()),
}))
vi.mock('../src/utils/kindle.js', () => ({
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
  fixEncoding,
  splitText,
  processText,
  convertToMobi,
}))

describe('convertNovel', () => {
  it('should process split files individually', async () => {
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

    expect(fixEncoding).toHaveBeenCalledWith(config)
    expect(splitText).toHaveBeenCalledWith(config, '/mock/novel/1.txt')
    expect(processText).toHaveBeenCalledTimes(2)
    expect(convertToMobi).toHaveBeenCalledTimes(2)
    expect(moveToKindle).toHaveBeenCalledTimes(2)
  })
})
