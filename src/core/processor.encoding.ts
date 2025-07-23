// 编码修复相关
import chardet from 'chardet'
import { glob, read, write } from 'fire-keeper'
import iconv from 'iconv-lite'

import type { Config } from './config.js'

export const fixEncoding = async (config: Config) => {
  const textFiles = await glob(`${config.novelStorage}/*.txt`)

  for (const filePath of textFiles) {
    const content = await read<string>(filePath)
    if (!content || content.includes('我')) continue

    const rawBuffer = await read(filePath, { raw: true })
    if (!rawBuffer || !(rawBuffer instanceof Buffer)) continue

    // 自动检测编码
    const detectedEncoding = chardet.detect(rawBuffer) ?? 'utf-8'
    // 兼容部分 chardet 返回值
    const encoding = detectedEncoding.toLowerCase().replace(/[^a-z0-9\-]/g, '')

    // 解码为 utf-8
    let utf8Buffer: Buffer
    try {
      utf8Buffer = iconv.encode(iconv.decode(rawBuffer, encoding), 'utf-8')
    } catch {
      // 检测失败时回退 gb2312
      utf8Buffer = iconv.encode(iconv.decode(rawBuffer, 'gb2312'), 'utf-8')
    }
    await write(filePath, utf8Buffer)
  }
}
