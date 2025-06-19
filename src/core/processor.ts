import { exec, getBasename, glob, os, read, write } from 'fire-keeper'
import iconv from 'iconv-lite'
import { Jimp } from 'jimp'

import type { Config } from './config.js'

const HTML_TEMPLATE = [
  '<html lang="zh-cmn-Hans">',
  '<head>',
  '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>',
  '</head>',
  '<body>',
  '{{content}}',
  '</body>',
  '</html>',
].join('')

const IS_WINDOWS = os() === 'windows'

export const processImages = async (config: Config, source: string) => {
  const basename = getBasename(source)
  const target = `${config.temp}/${basename}.html`

  const imagePaths = (await glob(`${source}/*.jpg`)).sort((a, b) => {
    const nameA = getBasename(a)
    const nameB = getBasename(b)
    return nameA.localeCompare(nameB)
  })

  const htmlElements: string[] = []
  for (const imagePath of imagePaths) {
    const image = await Jimp.read(imagePath)
    if (image.width > image.height) image.rotate(90)

    const { width } = image
    if (width > config.mangaMaxWidth) image.resize({ w: config.mangaMaxWidth })

    image.greyscale()

    const buffer = await image.getBuffer('image/jpeg', {
      quality: config.mangaQuality,
    })
    const html = `<p><img alt='' src='data:image/jpeg;base64,${buffer.toString('base64')}'></p>`
    htmlElements.push(html)
  }

  if (!htmlElements.length) return

  const content = HTML_TEMPLATE.replace('{{content}}', htmlElements.join('\n'))
  await write(target, content)
}

export const processText = async (config: Config, filePath: string) => {
  const basename = getBasename(filePath)
  const target = `${config.temp}/${basename}.html`

  const content = await read<string>(filePath)
  if (!content) return

  const htmlLines = content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .split('\n')
    .map((line) => {
      const trimmedLine = line.trim()
      return trimmedLine ? `<p>${trimmedLine}</p>` : ''
    })
    .filter((line) => line)

  const htmlContent = HTML_TEMPLATE.replace('{{content}}', htmlLines.join('\n'))
  await write(target, htmlContent)
}

export const convertToMobi = async (config: Config, filePath: string) => {
  const basename = getBasename(filePath)
  const htmlPath = IS_WINDOWS
    ? `${config.temp}/${basename}.html`
    : `"${config.temp}/${basename}.html"`

  const command = [
    config.kindlegen,
    htmlPath,
    '-c1',
    '-dont_append_source',
  ].join(' ')

  await exec(command)
}

export const splitText = async (config: Config, filePath: string) => {
  const basename = getBasename(filePath)
  const content = await read<string>(filePath)
  if (!content) throw new Error(`found no content in '${filePath}'`)

  const lines = content.replace(/\r/g, '').split('\n')

  const createChunks = (lines: string[]): string[][] => {
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
            acc.currentCharCount + lineCharCount > config.novelFileSize &&
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
                acc.currentCharCount + lineCharCount > config.novelFileSize &&
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

  const chunks = createChunks(lines)

  const writeChunkFiles = (chunks: string[][]): Promise<string[]> => {
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

  return writeChunkFiles(chunks)
}

export const fixEncoding = async (config: Config) => {
  const textFiles = await glob(`${config.novelStorage}/*.txt`)

  for (const filePath of textFiles) {
    const content = await read<string>(filePath)
    if (!content || content.includes('我')) continue

    const rawBuffer = await read(filePath, { raw: true })
    if (!rawBuffer) continue

    const utf8Buffer = iconv.encode(iconv.decode(rawBuffer, 'gb2312'), 'utf-8')
    await write(filePath, utf8Buffer)
  }
}
