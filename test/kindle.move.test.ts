// vitest for moveToKindle
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { isExistMock, globMock, copyMock, getBasenameMock, echoMock } =
  vi.hoisted(() => ({
    isExistMock: vi.fn(),
    globMock: vi.fn(),
    copyMock: vi.fn(),
    getBasenameMock: vi.fn(),
    echoMock: vi.fn(),
  }))

vi.mock('fire-keeper', () => ({
  isExist: isExistMock,
  glob: globMock,
  copy: copyMock,
  getBasename: getBasenameMock,
  echo: echoMock,
}))

import type { Config } from '../src/core/config'
import type * as KindleUtils from '../src/utils/kindle.js'

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
  let kindleUtils: typeof KindleUtils

  beforeEach(async () => {
    vi.resetModules()
    isExistMock.mockReset()
    globMock.mockReset()
    copyMock.mockReset()
    getBasenameMock.mockReset()
    echoMock.mockReset()
    kindleUtils = await import('../src/utils/kindle.js')
  })

  it('calls copy with correct arguments', async () => {
    getBasenameMock.mockImplementation(() => 'book1')
    await kindleUtils.moveToKindle(mockConfig, '/mock/documents/book1.mobi')
    expect(copyMock).toHaveBeenCalledWith(
      '/mock/temp/book1.mobi',
      '/mock/documents',
    )
  })
})
