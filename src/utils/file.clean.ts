import { exec, getBasename, glob, os, read, remove, write } from 'fire-keeper'

import type { Config } from '../core/config.js'

const IS_WINDOWS = os() === 'windows'
const WINDOWS_ESCAPE_START = /\[/g
const WINDOWS_ESCAPE_END = /\]/g
const RESERVED_CHARACTERS = /[\\/:*?"<>|]/g
const WINDOWS_SPECIAL_CHARS = /[[\]()]/g
const MAX_NAME_LENGTH = 20

const escapeForWindows = (path: string) =>
  path.replace(WINDOWS_ESCAPE_START, '`[').replace(WINDOWS_ESCAPE_END, '`]')

const replaceLastSegment = (path: string, next: string) =>
  path.replace(/[^\\/]+$/, next)

export const cleanName = (name: string) => {
  const replaced = name
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

  const sanitized = replaced.replace(RESERVED_CHARACTERS, '')
  return sanitized.length > MAX_NAME_LENGTH
    ? sanitized.slice(0, MAX_NAME_LENGTH)
    : sanitized
}

const renameDirectory = async (source: string, nextName: string) => {
  if (IS_WINDOWS) {
    await exec(`ren '${escapeForWindows(source)}' '${nextName}'`)
    return
  }

  await exec(`mv "${source}" "${replaceLastSegment(source, nextName)}"`)
}

export const cleanMangaNames = async (config: Config) => {
  const mangaDirs = await glob(`${config.mangaStorage}/*`, {
    onlyDirectories: true,
  })

  for (const dirPath of mangaDirs) {
    const currentName = getBasename(dirPath)
    const newName = cleanName(currentName)
    if (newName === currentName) continue

    await renameDirectory(dirPath, newName)
  }
}

const readAndRemove = async (path: string) => {
  const safePath = path.replace(WINDOWS_SPECIAL_CHARS, '*')
  const content = await read<string>(safePath)
  await remove(safePath)
  return content ?? ''
}

export const cleanNovelNames = async (config: Config) => {
  const novelFiles = await glob(`${config.novelStorage}/*.txt`)

  for (const filePath of novelFiles) {
    const currentName = getBasename(filePath)
    const newName = cleanName(currentName)
    if (newName === currentName) continue

    const content = await readAndRemove(filePath)
    const target = replaceLastSegment(filePath, `${newName}.txt`)
    await write(target, content)
  }
}

export const cleanTempDir = (config: Config) => remove(config.temp)
