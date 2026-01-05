import { write } from 'fire-keeper'

import type { Config } from '../core/config.js'

const NEW_LINE_SIZE = 1

export const createChunks = (lines: string[], maxSize: number): string[][] => {
  if (!lines.length) return []

  const chunks: string[][] = []
  let current: string[] = []
  let charCount = 0

  for (const line of lines) {
    const lineSize = line.length + NEW_LINE_SIZE
    if (current.length && charCount + lineSize > maxSize) {
      chunks.push(current)
      current = []
      charCount = 0
    }
    current.push(line)
    charCount += lineSize
  }
  if (current.length) chunks.push(current)
  return chunks
}

const buildTargetPath = (basename: string, index: number, config: Config) =>
  `${config.temp}/${basename}-${(index + 1).toString().padStart(2, '0')}.txt`

export const writeChunkFiles = (
  chunks: string[][],
  basename: string,
  config: Config,
): Promise<string[]> =>
  Promise.all(
    chunks.map(async (chunk, index) => {
      const target = buildTargetPath(basename, index, config)
      await write(target, chunk.join('\n'))
      return target
    }),
  )
