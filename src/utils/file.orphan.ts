import { getBasename, glob, remove } from 'fire-keeper'

import type { Config } from '../core/config.js'

const SERIAL_SUFFIX = /-\d+$/

const normalizeSerial = (name: string) => name.replace(SERIAL_SUFFIX, '')

const toBasenameSet = (paths: string[]) =>
  new Set(paths.map((path) => getBasename(path)))

const ensureNovelVariants = (names: Set<string>) => {
  const variants = new Set<string>()
  for (const name of names) variants.add(normalizeSerial(name))
  return variants
}

export const removeOrphaned = async (config: Config) => {
  const [mangaDirs, novelFiles, mobiFiles, sdrDirs] = await Promise.all([
    glob(`${config.mangaStorage}/*`, { onlyDirectories: true }),
    glob(`${config.novelStorage}/*.txt`),
    glob(`${config.documents}/*.mobi`),
    glob(`${config.documents}/*.sdr`, { onlyFiles: false }),
  ])

  const mangaNames = toBasenameSet(mangaDirs)
  const novelNames = toBasenameSet(novelFiles)
  const normalizedNovels = ensureNovelVariants(novelNames)

  const orphanedMobis = mobiFiles.filter((path) => {
    const name = getBasename(path)
    return !mangaNames.has(name) && !normalizedNovels.has(normalizeSerial(name))
  })

  if (orphanedMobis.length) await remove(orphanedMobis)

  const mobiNames = toBasenameSet(mobiFiles)
  const orphanedSdr = sdrDirs.filter(
    (path) => !mobiNames.has(getBasename(path)),
  )

  if (orphanedSdr.length) await remove(orphanedSdr)
}
