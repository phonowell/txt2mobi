import { exec, getBasename, glob, os, read, remove, write } from 'fire-keeper'

import type { Config } from '../core/config.js'

const IS_WINDOWS = os() === 'windows'

const formatPathForWindows = (path: string) =>
  path.replace(/\[/g, '`[').replace(/\]/g, '`]')

const cleanName = (name: string) =>
  name
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
    .replace(/\s{2,}/, ' ')
    .trim()

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
