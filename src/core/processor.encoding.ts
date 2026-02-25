import chardet from 'chardet'
import { echo, glob, read, write } from 'fire-keeper'
import iconv from 'iconv-lite'

import type { Config } from './config.js'

const FALLBACK_ENCODINGS = ['gb18030', 'gbk', 'gb2312']

const normalizeEncoding = (encoding: string) =>
  encoding.toLowerCase().replace(/[^a-z0-9\-]/g, '')

const isUtf8Buffer = (buffer: Buffer) => {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer)
    return true
  } catch {
    return false
  }
}

const buildEncodings = (detectedEncoding: string | null) => {
  const normalized = detectedEncoding
    ? normalizeEncoding(detectedEncoding)
    : null

  const candidates =
    normalized && normalized !== 'utf8' && normalized !== 'utf-8'
      ? [normalized, ...FALLBACK_ENCODINGS]
      : FALLBACK_ENCODINGS

  return [...new Set(candidates)]
}

const tryConvertToUtf8 = (
  buffer: Buffer,
  encodings: string[],
): Buffer | null => {
  for (const encoding of encodings) {
    if (!iconv.encodingExists(encoding)) continue
    try {
      return iconv.encode(iconv.decode(buffer, encoding), 'utf-8')
    } catch {
      continue
    }
  }

  return null
}

export const fixEncoding = async (config: Config) => {
  const textFiles = await glob(`${config.novelStorage}/*.txt`)

  for (const filePath of textFiles) {
    const rawBuffer = await read(filePath, { raw: true })
    if (!rawBuffer || !(rawBuffer instanceof Buffer)) continue

    if (isUtf8Buffer(rawBuffer)) continue

    try {
      const detectedEncoding = chardet.detect(rawBuffer)
      const utf8Buffer = tryConvertToUtf8(
        rawBuffer,
        buildEncodings(detectedEncoding),
      )
      if (!utf8Buffer) continue
      await write(filePath, utf8Buffer)
    } catch (error) {
      echo(
        `skip encoding conversion for '${filePath}': ${error instanceof Error ? error.message : String(error)}`,
      )
      continue
    }
  }
}
