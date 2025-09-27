import { copy, echo, getBasename, glob, isExist } from 'fire-keeper'

import type { Config } from '../core/config.js'

type MobiCache = {
  originals: Set<string>
  normalized: Set<string>
}

let mobiCache: MobiCache | null = null

const SERIAL_SUFFIX = /-\d+$/

const normalizeSerial = (name: string) => name.replace(SERIAL_SUFFIX, '')

const loadMobiCache = async (config: Config): Promise<MobiCache> => {
  const basenames = (await glob(`${config.documents}/*.mobi`)).map((path) =>
    getBasename(path),
  )
  return {
    originals: new Set(basenames),
    normalized: new Set(basenames.map(normalizeSerial)),
  }
}

export const validateEnv = async (config: Config) => {
  if (!(await isExist(config.kindlegen))) {
    echo(
      "found no 'kindlegen', run 'brew cask install kindlegen' to install it",
    )
    return false
  }

  if (!(await isExist(config.documents))) {
    echo(`found no '${config.documents}', kindle must be connected`)
    return false
  }

  return true
}

export const mobiExists = async (config: Config, filePath: string) => {
  mobiCache ??= await loadMobiCache(config)

  const baseName = getBasename(filePath)
  const normalized = normalizeSerial(baseName)

  return (
    mobiCache.originals.has(baseName) || mobiCache.normalized.has(normalized)
  )
}

export const moveToKindle = async (config: Config, filePath: string) => {
  const basename = getBasename(filePath)
  await copy(`${config.temp}/${basename}.mobi`, config.documents)
  if (mobiCache) {
    mobiCache.originals.add(basename)
    mobiCache.normalized.add(normalizeSerial(basename))
  }
}
