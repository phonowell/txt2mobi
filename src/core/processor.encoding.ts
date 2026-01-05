import chardet from 'chardet'
import { echo, glob, read, write } from 'fire-keeper'
import iconv from 'iconv-lite'

import type { Config } from './config.js'

const tryConvertToUtf8 = (
  buffer: Buffer,
  encodings: string[],
): Buffer | null => {
  for (const encoding of encodings)
    return iconv.encode(iconv.decode(buffer, encoding), 'utf-8')

  return null
}

export const fixEncoding = async (config: Config) => {
  const textFiles = await glob(`${config.novelStorage}/*.txt`)

  for (const filePath of textFiles) {
    const rawBuffer = await read(filePath, { raw: true })
    if (!rawBuffer || !(rawBuffer instanceof Buffer)) continue

    const detectedEncoding = chardet.detect(rawBuffer) ?? 'utf-8'
    const encoding = detectedEncoding.toLowerCase().replace(/[^a-z0-9\-]/g, '')

    if (encoding === 'utf8' || encoding === 'utf-8') continue

    try {
      const utf8Buffer = tryConvertToUtf8(rawBuffer, [encoding, 'gb2312'])
      if (!utf8Buffer) continue
      await write(filePath, utf8Buffer)
    } catch {
      echo(`skip encoding conversion for '${filePath}'`)
      continue
    }
  }
}
