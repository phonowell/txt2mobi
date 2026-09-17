import {
  getBasename,
  getDirname,
  getExtname,
  glob,
  isExist,
  remove,
  rename,
} from 'fire-keeper'

import type { Config } from '../core/config.js'

const RESERVED_CHARACTERS = /[\\/:*?"<>|]/g
const MAX_NAME_LENGTH = 120
const MAX_RENAME_ATTEMPTS = 1000

const removeTxtExtension = (name: string) => name.replace(/\.txt$/i, '')
const stripExtension = (name: string) => name.replace(/\.[^.]+$/, '')
const trimToLength = (name: string, maxLength = MAX_NAME_LENGTH) =>
  name.length > maxLength ? name.slice(0, maxLength).trim() : name

const buildCandidateName = (
  baseName: string,
  extension: string,
  suffix = '',
) => {
  const trimmed = trimToLength(baseName, MAX_NAME_LENGTH - suffix.length)
  const safeBase = trimmed || 'untitled'
  return `${safeBase}${suffix}${extension}`
}

const ensureUniqueTargetName = async (source: string, targetName: string) => {
  const currentName = `${getBasename(source)}${getExtname(source)}`
  if (currentName === targetName) return targetName

  const dir = getDirname(source)
  if (!(await isExist(`${dir}/${targetName}`))) return targetName

  const extension = getExtname(targetName)
  const baseName = stripExtension(targetName)
  for (let index = 2; index < MAX_RENAME_ATTEMPTS; index += 1) {
    const candidate = buildCandidateName(baseName, extension, ` ${index}`)
    if (!(await isExist(`${dir}/${candidate}`))) return candidate
  }
  throw new Error(`cannot find unique name for '${targetName}'`)
}

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

  return trimToLength(replaced.replace(RESERVED_CHARACTERS, ''))
}

export const cleanMangaNames = async (config: Config) => {
  const mangaDirs = await glob(`${config.mangaStorage}/*`, {
    onlyDirectories: true,
  })

  for (const dirPath of mangaDirs) {
    const currentName = getBasename(dirPath)
    const newName = cleanName(currentName)
    if (newName === currentName) continue

    await rename(dirPath, await ensureUniqueTargetName(dirPath, newName), {
      echo: false,
    })
  }
}

export const cleanNovelNames = async (config: Config) => {
  const novelFiles = await glob(`${config.novelStorage}/*.txt`)

  for (const filePath of novelFiles) {
    const currentName = `${getBasename(filePath)}.txt`
    const currentBaseName = removeTxtExtension(currentName)
    const newName = cleanName(currentBaseName)
    if (newName === currentBaseName) continue

    const targetName = await ensureUniqueTargetName(
      filePath,
      buildCandidateName(newName, '.txt'),
    )
    await rename(filePath, targetName, { echo: false })
  }
}

export const cleanTempDir = (config: Config) => remove(config.temp)
