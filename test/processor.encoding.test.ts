// vitest for fixEncoding
import { describe, expect, it } from 'vitest'

import {
  mockChardetDetect,
  mockGlob,
  mockIconv,
  mockRead,
  mockWrite,
  setupProcessorMocks,
} from './processor-test-utils.js'

setupProcessorMocks()

const config = {
  documents: '/mock/documents',
  kindlegen: '/bin/kindlegen',
  mangaMaxWidth: 1280,
  mangaQuality: 80,
  mangaStorage: '/mock/manga',
  novelFileSize: 2,
  novelStorage: '/mock/novel',
  temp: '/tmp',
}

describe('fixEncoding', () => {
  it('原始内容已是 UTF-8 时不改写文件', async () => {
    mockGlob.mockResolvedValueOnce(['/mock/novel/1.txt'])
    const utf8Buffer = Buffer.from('你好，UTF-8', 'utf-8')
    mockRead.mockImplementationOnce((_path, opts) => {
      if (opts?.raw) return Promise.resolve(utf8Buffer)
      return Promise.resolve('')
    })
    mockChardetDetect.mockReturnValueOnce('GB2312')

    const mod = await import('../src/core/processor.js')
    await expect(mod.fixEncoding(config)).resolves.not.toThrow()

    expect(mockWrite).not.toHaveBeenCalled()
    expect(mockIconv.decode).not.toHaveBeenCalled()
  })

  it('检测误判为 UTF-8 但字节无效时仍尝试回退转码', async () => {
    mockGlob.mockResolvedValueOnce(['/mock/novel/2.txt'])
    const gb2312Buffer = Buffer.from([0xc4, 0xe3, 0xba, 0xc3]) // "你好"
    mockRead.mockImplementationOnce((_path, opts) => {
      if (opts?.raw) return Promise.resolve(gb2312Buffer)
      return Promise.resolve('')
    })
    mockChardetDetect.mockReturnValueOnce('UTF-8')
    mockIconv.decode.mockImplementationOnce(
      (_buffer: Buffer, encoding: string) => {
        expect(encoding).toBe('gb18030')
        return '你好'
      },
    )
    mockIconv.encode.mockReturnValueOnce(Buffer.from('你好', 'utf-8'))

    const mod = await import('../src/core/processor.js')
    await expect(mod.fixEncoding(config)).resolves.not.toThrow()

    expect(mockWrite).toHaveBeenCalledTimes(1)
    expect(mockIconv.decode).toHaveBeenCalledWith(gb2312Buffer, 'gb18030')
  })

  it('首选编码失败后继续尝试后备编码', async () => {
    mockGlob.mockResolvedValueOnce(['/mock/novel/3.txt'])
    const rawBuffer = Buffer.from([0x82, 0xb1, 0x82, 0xf1])
    mockRead.mockImplementationOnce((_path, opts) => {
      if (opts?.raw) return Promise.resolve(rawBuffer)
      return Promise.resolve('')
    })
    mockChardetDetect.mockReturnValueOnce('gbk')
    mockIconv.decode
      .mockImplementationOnce((_buffer: Buffer, _encoding: string) => {
        throw new Error('decode failed')
      })
      .mockImplementationOnce(() => '你好')
    mockIconv.encode.mockReturnValueOnce(Buffer.from('你好', 'utf-8'))

    const mod = await import('../src/core/processor.js')
    await expect(mod.fixEncoding(config)).resolves.not.toThrow()

    const attemptedEncodings = mockIconv.decode.mock.calls.map(
      (call) => call[1],
    )
    expect(attemptedEncodings.length).toBeGreaterThan(1)
    expect(attemptedEncodings).toContain('gb18030')
    expect(mockWrite).toHaveBeenCalledTimes(1)
  })
})
