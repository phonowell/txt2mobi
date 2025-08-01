import { exec, getBasename, glob, os, read, remove, write } from 'fire-keeper'

import type { Config } from '../core/config.js'

const IS_WINDOWS = os() === 'windows'

const formatPathForWindows = (path: string) =>
  path.replace(/\[/g, '`[').replace(/\]/g, '`]')

const cleanName = (name: string) => {
  // 替换部分英文符号为中文符号
  let result = name
    .replace(/!/g, '！')
    .replace(/,/g, '，')
    .replace(/:/g, '：')
    .replace(/\?/g, '？')
    .replace(/《/g, '')
    .replace(/》/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\{.*?\}/g, '')
    .replace(/<.*?>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
  // 过滤所有平台保留字符（Windows: \ / : * ? " < > |）
  result = result.replace(/[\\\/:\*\?"<>\|]/g, '')
  // 限制文件名长度（如 20 字符，避免设备异常）
  if (result.length > 20) result = result.slice(0, 20)
  return result
}

export const cleanMangaNames = async (config: Config) => {
  const mangaDirs = await glob(`${config.mangaStorage}/*`, {
    onlyDirectories: true,
  })

  for (const dirPath of mangaDirs) {
    const currentName = getBasename(dirPath)
    const newName = cleanName(currentName)
    if (newName === currentName) continue

    const newPath = dirPath.replace(currentName, newName)
    const command = IS_WINDOWS
      ? `ren '${formatPathForWindows(dirPath)}' '${newName}'`
      : `mv "${dirPath}" "${newPath}"`

    await exec(command)
  }
}

export const cleanNovelNames = async (config: Config) => {
  const novelFiles = await glob(`${config.novelStorage}/*.txt`)

  for (const filePath of novelFiles) {
    const currentName = getBasename(filePath)
    const newName = cleanName(currentName)
    if (newName === currentName) continue

    const tempPath = filePath.replace(/[[\]()]/g, '*')
    const content = await read(tempPath)
    await remove(tempPath)
    await write(filePath.replace(currentName, newName), content)
  }
}

export const cleanTempDir = (config: Config) => remove(config.temp)
// 按文件名排序
export const sortByBasename = (paths: string[]) =>
  paths.sort((a, b) => {
    const nameA = getBasename(a)
    const nameB = getBasename(b)
    return nameA.localeCompare(nameB)
  })

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

// 文本格式化
export const formatHtmlLines = (content: string) =>
  content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .split('\n')
    .map((line) => {
      const trimmedLine = line.trim()
      return trimmedLine ? `<p>${trimmedLine}</p>` : ''
    })
    .filter((line) => line)

export const removeOrphaned = async (config: Config) => {
  const mangaNames = (
    await glob(`${config.mangaStorage}/*`, { onlyDirectories: true })
  ).map(getBasename)
  const novelNames = (await glob(`${config.novelStorage}/*.txt`)).map(
    getBasename,
  )
  const mobiNames = (await glob(`${config.documents}/*.mobi`)).map(getBasename)

  const orphanedMobiFiles = mobiNames
    .map((name) =>
      mangaNames.includes(name) || novelNames.includes(name.replace(/-\d+/, ''))
        ? ''
        : name,
    )
    .filter((name) => !!name)
    .map((name) => `${config.documents}/${name}.mobi`)

  if (orphanedMobiFiles.length) await remove(orphanedMobiFiles)

  const sdrNames = (
    await glob(`${config.documents}/*.sdr`, { onlyFiles: false })
  ).map(getBasename)

  const orphanedSdrFolders = sdrNames
    .map((name) => (mobiNames.includes(name) ? '' : name))
    .filter((name) => !!name)
    .map((name) => `${config.documents}/${name}.sdr`)

  if (orphanedSdrFolders.length) await remove(orphanedSdrFolders)
}
