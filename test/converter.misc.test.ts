import { describe, expect, it, vi } from 'vitest'

vi.mock('../utils/file.js', () => ({
  cleanMangaNames: vi.fn(() => Promise.resolve(['/mock/manga/1'])),
  cleanNovelNames: vi.fn(() => Promise.resolve(['/mock/novel/1.txt'])),
  cleanTempDir: vi.fn(() => Promise.resolve()),
}))
vi.mock('../utils/kindle.js', () => ({
  mobiExists: vi.fn(() => Promise.resolve(false)),
  moveToKindle: vi.fn(() => Promise.resolve()),
}))
vi.mock('fire-keeper', () => ({
  glob: vi.fn(() => Promise.resolve(['/mock/manga/1'])),
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
  processImages: vi.fn(() => Promise.resolve()),
  convertToMobi: vi.fn(() => Promise.resolve()),
  fixEncoding: vi.fn(() => Promise.resolve()),
  splitText: vi.fn(() => Promise.resolve(['/mock/novel/1-1.txt'])),
  processText: vi.fn(() => Promise.resolve()),
}))

describe('convertManga/convertNovel 其他异常', () => {
  it('should handle missing mangaStorage in config gracefully', async () => {
    const { convertManga } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '', // 空字符串模拟缺失
      novelStorage: '/mock/novel',
      documents: '/mock/documents',
      temp: '/mock/temp',
      kindlegen: '/mock/kindlegen',
      mangaMaxWidth: 1280,
      mangaQuality: 80,
      novelFileSize: 200000,
    }
    await expect(convertManga(config)).resolves.toBeUndefined()
  })

  it('should handle missing novelStorage in config gracefully', async () => {
    const { convertNovel } = await import('../src/core/converter.js')
    const config = {
      mangaStorage: '/mock/manga',
      novelStorage: '', // 空字符串模拟缺失
      documents: '/mock/documents',
      temp: '/mock/temp',
      kindlegen: '/mock/kindlegen',
      mangaMaxWidth: 1280,
      mangaQuality: 80,
      novelFileSize: 200000,
    }
    await expect(convertNovel(config)).resolves.toBeUndefined()
  })
})
