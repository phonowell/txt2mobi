// mobi转换与文本分割相关
import { exec, getBasename, os, read } from 'fire-keeper'

import { createChunks, writeChunkFiles } from '../utils/chunk.js'

import type { Config } from './config.js'

const IS_WINDOWS = os() === 'windows'

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
  const chunks = createChunks(lines, config.novelFileSize)
  return writeChunkFiles(chunks, basename, config)
}
