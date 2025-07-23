import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

describe('loadConfig 平台与异常', () => {
  it('should throw if config.yaml is missing', async () => {
    vi.doMock('fire-keeper', () => ({
      read: () => undefined,
      os: () => 'macos',
    }))
    const { loadConfig } = await import('../src/core/config.js')
    await expect(loadConfig()).rejects.toThrow('config.yaml not found')
  })

  it('should select correct platform for windows', async () => {
    vi.doMock('fire-keeper', () => ({
      read: () => ({
        basic: {
          documents: { macos: '/mac/doc', windows: 'C:/doc' },
          kindlegen: { macos: '/mac/kindlegen', windows: 'C:/kindlegen' },
        },
        manga: {
          storage: { macos: '/mac/manga', windows: 'C:/manga' },
          maxWidth: 1280,
          quality: 80,
        },
        novel: {
          storage: { macos: '/mac/novel', windows: 'C:/novel' },
          fileSize: 200000,
        },
      }),
      os: () => 'windows',
    }))
    const { loadConfig } = await import('../src/core/config.js')
    const config = await loadConfig()
    expect(config.documents).toBe('C:/doc')
    expect(config.kindlegen).toBe('C:/kindlegen')
    expect(config.mangaStorage).toBe('C:/manga')
    expect(config.novelStorage).toBe('C:/novel')
  })

  it('should support string type for all path fields', async () => {
    vi.doMock('fire-keeper', () => ({
      read: () => ({
        basic: {
          documents: '/only/doc',
          kindlegen: '/only/kindlegen',
        },
        manga: {
          storage: '/only/manga',
          maxWidth: 1280,
          quality: 80,
        },
        novel: {
          storage: '/only/novel',
          fileSize: 200000,
        },
      }),
      os: () => 'macos',
    }))
    const { loadConfig } = await import('../src/core/config.js')
    const config = await loadConfig()
    expect(config.documents).toBe('/only/doc')
    expect(config.kindlegen).toBe('/only/kindlegen')
    expect(config.mangaStorage).toBe('/only/manga')
    expect(config.novelStorage).toBe('/only/novel')
  })
})
