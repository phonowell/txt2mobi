import { getBasename, glob, remove } from 'fire-keeper'

import { normalizeSerial } from './serial.js'

import type { Config } from '../core/config.js'

const toBasenameSet = (paths: string[]) =>
  new Set(paths.map((path) => getBasename(path)))

export const removeOrphaned = async (config: Config) => {
  const [mangaDirs, novelFiles, mobiFiles, sdrDirs] = await Promise.all([
    glob(`${config.mangaStorage}/*`, { onlyDirectories: true }),
    glob(`${config.novelStorage}/*.txt`),
    glob(`${config.documents}/*.mobi`),
    glob(`${config.documents}/*.sdr`, { onlyDirectories: true }),
  ])

  const mangaNames = toBasenameSet(mangaDirs)
  const normalizedNovels = new Set(
    [...toBasenameSet(novelFiles)].map(normalizeSerial),
  )

  const orphanedMobis = mobiFiles.filter((path) => {
    const name = getBasename(path)
    return !mangaNames.has(name) && !normalizedNovels.has(normalizeSerial(name))
  })

  if (orphanedMobis.length) await remove(orphanedMobis)

  const removedMobiNames = toBasenameSet(orphanedMobis)
  const mobiNames = new Set(
    mobiFiles
      .map((path) => getBasename(path))
      .filter((name) => !removedMobiNames.has(name)),
  )
  const orphanedSdr = sdrDirs.filter(
    (path) => !mobiNames.has(getBasename(path)),
  )

  if (orphanedSdr.length) await remove(orphanedSdr)
}
