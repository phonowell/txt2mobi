import { describe, expect, it, vi } from 'vitest'

vi.mock('../utils/file.js', () => ({
  cleanNovelNames: vi.fn(() => Promise.resolve([])),
  cleanTempDir: vi.fn(() => Promise.resolve()),
}))
vi.mock('../utils/kindle.js', () => ({
  mobiExists: vi.fn(() => Promise.resolve(false)),
  moveToKindle: vi.fn(() => Promise.resolve()),
}))
vi.mock('fire-keeper', () => ({
  glob: vi.fn(() => Promise.resolve([])),
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
  splitText: vi.fn(() => Promise.resolve(['/mock/novel/1-1.txt', '/mock/novel/1-2.txt'])),
  processText: vi.fn(() => Promise.resolve()),
  convertToMobi: vi.fn(() => Promise.resolve()),
}))

describe('convertNovel', () => {
  it('should handle empty novel storage gracefully', async () => {
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
    const result = await convertNovel(config)
    expect(result).toBeUndefined()
  })
})
