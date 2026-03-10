// mobi转换与文本分割相关
import { exec, getBasename, isExist, read } from 'fire-keeper'

import { createChunks, writeChunkFiles } from '../utils/chunk.js'

import type { Config } from './config.js'

const quoteShellArg = (value: string) => `"${value.replace(/"/g, '\\"')}"`

export const convertToMobi = async (config: Config, htmlPath: string) => {
  if (!(await isExist(htmlPath)))
    throw new Error(`html source not found: '${htmlPath}'`)

  const basename = getBasename(htmlPath)

  const command = [
    quoteShellArg(config.kindlegen),
    quoteShellArg(htmlPath),
    '-c1',
    '-dont_append_source',
  ].join(' ')

  await exec(command)
  return `${config.temp}/${basename}.mobi`
}

export const splitText = async (config: Config, filePath: string) => {
  const basename = getBasename(filePath)
  const content = await read<string>(filePath)
  if (!content?.trim()) throw new Error(`found no content in '${filePath}'`)

  const lines = content.replace(/\r/g, '').split('\n')
  const chunks = createChunks(lines, config.novelFileSize)
  if (!chunks.length)
    throw new Error(`found no chunkable content in '${filePath}'`)
  return writeChunkFiles(chunks, basename, config)
}
