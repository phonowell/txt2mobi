/**
 * processor 相关测试通用 mock/setup/断言工具
 * 可直接被 processor.test.ts 及所有 processor 相关测试复用
 */
import { afterEach, beforeEach, vi } from 'vitest'

import type { Mock } from 'vitest'

/** mock: fire-keeper.write */
export const mockWrite = vi.fn()
/** mock: fire-keeper.read */
export const mockRead: Mock<
  (path: string, _opts?: { raw?: boolean }) => Promise<string | Buffer>
> = vi.fn((_path: string, _opts?: { raw?: boolean }) =>
  Promise.resolve('mock content'),
)
/** mock: fire-keeper.glob */
export const mockGlob = vi.fn<(...args: unknown[]) => Promise<string[]>>(() =>
  Promise.resolve([]),
)
/** mock: fire-keeper.exec */
export const mockExec = vi.fn(() => Promise.resolve())
/** mock: fire-keeper.getBasename */
export const mockGetBasename = vi.fn((p: string) => p.split('/').pop() ?? '')
/** mock: fire-keeper.os */
export const mockOs = vi.fn(() => 'macos')
/** mock: jimp.Jimp.read */
export const mockJimpRead = vi.fn(() => ({
  width: 100,
  height: 200,
  rotate: vi.fn(),
  resize: vi.fn(),
  greyscale: vi.fn(),
  getBuffer: vi.fn((_type: string, _opts: unknown) =>
    Promise.resolve(Buffer.from('mock', 'utf-8')),
  ),
}))
/** mock: iconv-lite */
export const mockIconv = {
  encode: vi.fn(() => Buffer.from('mock', 'utf-8')),
  decode: vi.fn(() => 'mock'),
}

/**
 * 统一 mock processor 相关依赖，并自动清理
 * 可在各测试文件顶层直接调用
 * 支持自定义 mock 行为（如 mockRead.mockImplementation）
 */
export const setupProcessorMocks = () => {
  vi.mock('fire-keeper', () => ({
    write: mockWrite,
    read: mockRead,
    glob: mockGlob,
    exec: mockExec,
    getBasename: mockGetBasename,
    os: mockOs,
  }))
  vi.mock('jimp', () => ({
    Jimp: { read: mockJimpRead },
  }))
  vi.mock('iconv-lite', () => mockIconv)

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    clearProcessorMocks()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })
}

/**
 * 清理所有 processor 相关 mock
 * 可用于 beforeEach/afterEach
 */
export const clearProcessorMocks = () => {
  mockWrite.mockClear()
  mockRead.mockClear()
  mockGlob.mockClear()
  mockExec.mockClear()
  mockGetBasename.mockClear()
  mockOs.mockClear()
  mockJimpRead.mockClear()
  mockIconv.encode.mockClear()
  mockIconv.decode.mockClear()
}

/**
 * 恢复所有 mock（如 vi.restoreAllMocks），可用于 afterEach
 */
export const restoreProcessorMocks = () => {
  vi.restoreAllMocks()
}
