import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadConfig } from '../src/core/config.js'

afterEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

describe('loadConfig 基础功能', () => {
  it('should be a function', () => {
    expect(typeof loadConfig).toBe('function')
  })

  it('should load and normalize config.yaml (platform: macos)', async () => {
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
      os: () => 'macos',
    }))
    const { loadConfig } = await import('../src/core/config.js')
    const config = await loadConfig()
    expect(config).toEqual({
      documents: '/mac/doc',
      kindlegen: '/mac/kindlegen',
      mangaMaxWidth: 1280,
      mangaQuality: 80,
      mangaStorage: '/mac/manga',
      novelFileSize: 200000,
      novelStorage: '/mac/novel',
      temp: './temp/kindle',
    })
  })
})
