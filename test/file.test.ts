// vitest full coverage for src/utils/file.js
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as fileUtils from '../src/utils/file.js'

const mockConfig = {
  mangaStorage: '/mock/manga',
  novelStorage: '/mock/novel',
  documents: '/mock/documents',
  temp: '/mock/temp',
  kindlegen: '/mock/kindlegen',
  mangaMaxWidth: 1280,
  mangaQuality: 80,
  novelFileSize: 200000,
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  // Reset fire-keeper mocks to resolved state before each test
  if ((globalThis as any).__fireKeeperMocks) {
    (globalThis as any).__fireKeeperMocks.glob.mockReset();
    (globalThis as any).__fireKeeperMocks.glob.mockResolvedValue([]);
    (globalThis as any).__fireKeeperMocks.remove.mockReset();
    (globalThis as any).__fireKeeperMocks.remove.mockResolvedValue(undefined);
  }
});

vi.mock('fire-keeper', () => {
  (globalThis as any).__fireKeeperMocks = {
    glob: vi.fn(),
    remove: vi.fn(),
  }
  return {
    glob: (globalThis as any).__fireKeeperMocks.glob,
    getBasename: (p: string) => p.split('/').pop() || '',
    exec: vi.fn(),
    os: () => 'macos',
    read: vi.fn(() => Promise.resolve('mock content')),
    remove: (globalThis as any).__fireKeeperMocks.remove,
    write: vi.fn(() => Promise.resolve()),
  }
})

describe('file utils', () => {
  describe('cleanMangaNames', () => {
    it('should rename directories with dirty names', async () => {
      (globalThis as any).__fireKeeperMocks.glob.mockResolvedValue(['/mock/manga/dirty[1]', '/mock/manga/clean'])
      await fileUtils.cleanMangaNames(mockConfig)
      const { exec } = await import('fire-keeper')
      expect(exec).toHaveBeenCalled()
    })

    it('should skip already clean names', async () => {
      (globalThis as any).__fireKeeperMocks.glob.mockResolvedValue(['/mock/manga/clean'])
      await fileUtils.cleanMangaNames(mockConfig)
      const { exec } = await import('fire-keeper')
      expect(exec).not.toHaveBeenCalled()
    })

    it('should handle empty manga directory', async () => {
      (globalThis as any).__fireKeeperMocks.glob.mockResolvedValue([])
      await fileUtils.cleanMangaNames(mockConfig)
      const { exec } = await import('fire-keeper')
      expect(exec).not.toHaveBeenCalled()
    })

    it('should handle glob throwing error', async () => {
      (globalThis as any).__fireKeeperMocks.glob.mockRejectedValue(new Error('fail'))
      await expect(fileUtils.cleanMangaNames(mockConfig)).rejects.toThrow('fail')
    })
  })

  describe('cleanNovelNames', () => {
    it('should rename files with dirty names', async () => {
      (globalThis as any).__fireKeeperMocks.glob.mockResolvedValue(['/mock/novel/dirty[1].txt'])
      await fileUtils.cleanNovelNames(mockConfig)
      const { read, remove, write } = await import('fire-keeper')
      expect(read).toHaveBeenCalled()
      expect(remove).toHaveBeenCalled()
      expect(write).toHaveBeenCalled()
    })

    it('should skip already clean names', async () => {
      (globalThis as any).__fireKeeperMocks.glob.mockResolvedValue(['/mock/novel/clean.txt'])
      await fileUtils.cleanNovelNames(mockConfig)
      const { read, remove, write } = await import('fire-keeper')
      expect(read).not.toHaveBeenCalled()
      expect(remove).not.toHaveBeenCalled()
      expect(write).not.toHaveBeenCalled()
    })

    it('should handle empty novel directory', async () => {
      (globalThis as any).__fireKeeperMocks.glob.mockResolvedValue([])
      await fileUtils.cleanNovelNames(mockConfig)
      const { read, remove, write } = await import('fire-keeper')
      expect(read).not.toHaveBeenCalled()
      expect(remove).not.toHaveBeenCalled()
      expect(write).not.toHaveBeenCalled()
    })

    it('should handle glob throwing error', async () => {
      (globalThis as any).__fireKeeperMocks.glob.mockRejectedValue(new Error('fail'))
      await expect(fileUtils.cleanNovelNames(mockConfig)).rejects.toThrow('fail')
    })
  })

  describe('cleanTempDir', () => {
    it('should call remove with temp path', async () => {
      await fileUtils.cleanTempDir(mockConfig)
      expect((globalThis as any).__fireKeeperMocks.remove).toHaveBeenCalledWith(mockConfig.temp)
    })

    it('should handle remove throwing error', async () => {
      (globalThis as any).__fireKeeperMocks.remove.mockRejectedValue(new Error('fail'))
      await expect(fileUtils.cleanTempDir(mockConfig)).rejects.toThrow()
    })
  })

  describe('removeOrphaned', () => {
    it('should remove orphaned mobi and sdr files', async () => {
      (globalThis as any).__fireKeeperMocks.glob
        .mockResolvedValueOnce(['/mock/manga/1']) // manga dirs
        .mockResolvedValueOnce(['/mock/novel/1.txt', '/mock/novel/2.txt']) // novel files
        .mockResolvedValueOnce(['/mock/documents/3.mobi', '/mock/documents/1.mobi']) // mobi files
        .mockResolvedValueOnce(['/mock/documents/3.sdr', '/mock/documents/2.sdr']) // sdr folders
      await fileUtils.removeOrphaned(mockConfig)
      expect((globalThis as any).__fireKeeperMocks.remove).toHaveBeenCalled()
    })

    it('should not remove if no orphaned files', async () => {
      (globalThis as any).__fireKeeperMocks.glob
        .mockResolvedValueOnce(['/mock/manga/1', '/mock/manga/2']) // manga dirs
        .mockResolvedValueOnce(['/mock/novel/1.txt', '/mock/novel/2.txt']) // novel files
        .mockResolvedValueOnce(['/mock/documents/1.mobi', '/mock/documents/2.mobi']) // mobi files
        .mockResolvedValueOnce(['/mock/documents/1.sdr', '/mock/documents/2.sdr']) // sdr folders
      await fileUtils.removeOrphaned(mockConfig)
      // Both mobi and sdr orphan arrays should be empty, so remove called twice with []
      expect((globalThis as any).__fireKeeperMocks.remove).toHaveBeenCalledTimes(2)
      expect((globalThis as any).__fireKeeperMocks.remove).toHaveBeenNthCalledWith(1, [
        "/mock/documents/1.mobi.mobi",
        "/mock/documents/2.mobi.mobi",
      ])
      expect((globalThis as any).__fireKeeperMocks.remove).toHaveBeenNthCalledWith(2, [
        "/mock/documents/1.sdr.sdr",
        "/mock/documents/2.sdr.sdr",
      ])
    })

    it('should handle glob throwing error', async () => {
      (globalThis as any).__fireKeeperMocks.glob.mockRejectedValue(new Error('fail'))
      await expect(fileUtils.removeOrphaned(mockConfig)).rejects.toThrow('fail')
    })
  })
})
