// vitest for validateEnv
import { beforeEach, describe, expect, it, vi } from 'vitest'

let isExist: ReturnType<typeof vi.fn>
let echo: ReturnType<typeof vi.fn>

beforeEach(() => {
  isExist = vi.fn()
  echo = vi.fn()
  vi.doMock('fire-keeper', () => ({
    isExist,
    echo,
    glob: vi.fn(),
    copy: vi.fn(),
    getBasename: vi.fn(),
  }))
  vi.resetModules()
  vi.clearAllMocks()
})

const mockConfig = {
  kindlegen: '/mock/kindlegen',
  documents: '/mock/documents',
  temp: '/mock/temp',
  mangaMaxWidth: 1200,
  mangaQuality: 90,
  mangaStorage: '/mock/manga',
  novelFileSize: 100,
  novelStorage: '/mock/novel',
}

describe('kindle utils - validateEnv', () => {
  it('should validate environment and handle missing dependencies', async () => {
    const kindleUtils = await import('../src/utils/kindle.js')

    // Test missing kindlegen
    isExist.mockResolvedValueOnce(false)
    let result = await kindleUtils.validateEnv(mockConfig)
    expect(result).toBe(false)
    expect(echo).toHaveBeenCalledWith(
      "found no 'kindlegen', run 'brew cask install kindlegen' to install it",
    )

    // Test missing documents directory
    isExist.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    result = await kindleUtils.validateEnv(mockConfig)
    expect(result).toBe(false)
    expect(echo).toHaveBeenCalledWith(
      "found no '/mock/documents', kindle must be connected",
    )

    // Test both exist
    isExist.mockResolvedValue(true)
    result = await kindleUtils.validateEnv(mockConfig)
    expect(result).toBe(true)
  })
})
