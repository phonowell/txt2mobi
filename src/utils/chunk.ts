import { write } from 'fire-keeper'

import type { Config } from '../core/config.js'

// 数组分割
export const createChunks = (lines: string[], maxSize: number): string[][] => {
  if (lines.length === 0) return []
  return lines
    .reduce<{
      chunks: string[][]
      currentChunk: string[]
      currentCharCount: number
    }>(
      (acc, line) => {
        const lineCharCount = line.length + 1
        if (
          acc.currentCharCount + lineCharCount > maxSize &&
          acc.currentChunk.length > 0
        ) {
          return {
            chunks: [...acc.chunks, acc.currentChunk],
            currentChunk: [line],
            currentCharCount: lineCharCount,
          }
        }
        return {
          chunks: acc.chunks,
          currentChunk: [...acc.currentChunk, line],
          currentCharCount: acc.currentCharCount + lineCharCount,
        }
      },
      { chunks: [], currentChunk: [], currentCharCount: 0 },
    )
    .chunks.concat(
      [
        lines.reduce<{ currentChunk: string[]; currentCharCount: number }>(
          (acc, line) => {
            const lineCharCount = line.length + 1
            if (
              acc.currentCharCount + lineCharCount > maxSize &&
              acc.currentChunk.length > 0
            )
              return { currentChunk: [line], currentCharCount: lineCharCount }
            return {
              currentChunk: [...acc.currentChunk, line],
              currentCharCount: acc.currentCharCount + lineCharCount,
            }
          },
          { currentChunk: [], currentCharCount: 0 },
        ).currentChunk,
      ].filter((chunk) => chunk.length > 0),
    )
}

// 批量写文件
export const writeChunkFiles = (
  chunks: string[][],
  basename: string,
  config: Config,
): Promise<string[]> => {
  const writeChunk = async (
    chunk: string[],
    index: number,
  ): Promise<string> => {
    const target = `${config.temp}/${basename}-${(index + 1).toString().padStart(2, '0')}.txt`
    await write(target, chunk.join('\n'))
    return target
  }
  return Promise.all(chunks.map(writeChunk))
}
