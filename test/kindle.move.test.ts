// vitest for moveToKindle
import { beforeEach, describe, expect, it, vi } from 'vitest'

// 类型声明
declare global {
  var isExistMock: ReturnType<typeof vi.fn>
  var globMock: ReturnType<typeof vi.fn>
  var copyMock: ReturnType<typeof vi.fn>
  var getBasenameMock: ReturnType<typeof vi.fn>
  var echoMock: ReturnType<typeof vi.fn>
}

globalThis.isExistMock = vi.fn()
globalThis.globMock = vi.fn()
globalThis.copyMock = vi.fn()
globalThis.getBasenameMock = vi.fn()
globalThis.echoMock = vi.fn()

vi.mock('fire-keeper', () => ({
  isExist: (...args: unknown[]) => globalThis.isExistMock(...args),
  glob: (...args: unknown[]) => globalThis.globMock(...args),
  copy: (...args: unknown[]) => globalThis.copyMock(...args),
  getBasename: (...args: unknown[]) => globalThis.getBasenameMock(...args),
  echo: (...args: unknown[]) => globalThis.echoMock(...args),
}))

import type { Config } from '../src/core/config'

const mockConfig: Config = {
  kindlegen: '/mock/kindlegen',
  documents: '/mock/documents',
  temp: '/mock/temp',
  mangaMaxWidth: 1200,
  mangaQuality: 90,
  mangaStorage: '/mock/manga',
  novelFileSize: 100,
  novelStorage: '/mock/novel',
}

describe('kindle utils - moveToKindle', () => {
  let kindleUtils: typeof import('../src/utils/kindle.js')

  beforeEach(async () => {
    vi.resetModules()
    globalThis.isExistMock.mockReset()
    globalThis.globMock.mockReset()
    globalThis.copyMock.mockReset()
    globalThis.getBasenameMock.mockReset()
    globalThis.echoMock.mockReset()
    kindleUtils = await import('../src/utils/kindle.js')
  })

  it('calls copy with correct arguments', async () => {
    globalThis.getBasenameMock.mockImplementation(() => 'book1')
    await kindleUtils.moveToKindle(mockConfig, '/mock/documents/book1.mobi')
    expect(globalThis.copyMock).toHaveBeenCalledWith(
      '/mock/temp/book1.mobi',
      '/mock/documents',
    )
  })
})
