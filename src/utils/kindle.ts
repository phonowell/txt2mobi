import { copy, echo, getBasename, glob, isExist } from 'fire-keeper'

import { normalizeSerial } from './serial.js'

import type { Config } from '../core/config.js'

type MobiCache = {
  documents: string
  originals: Set<string>
  normalized: Set<string>
}

let mobiCache: MobiCache | null = null

const loadMobiCache = async (config: Config): Promise<MobiCache> => {
  const basenames = (await glob(`${config.documents}/*.mobi`)).map((path) =>
    getBasename(path),
  )
  return {
    documents: config.documents,
    originals: new Set(basenames),
    normalized: new Set(basenames.map(normalizeSerial)),
  }
}

export const validateEnv = async (config: Config) => {
  if (!(await isExist(config.kindlegen))) {
    echo(`found no kindlegen binary at '${config.kindlegen}'`)
    return false
  }

  if (!(await isExist(config.documents))) {
    echo(`found no '${config.documents}', kindle must be connected`)
    return false
  }

  return true
}

export const mobiExists = async (config: Config, filePath: string) => {
  if (mobiCache?.documents !== config.documents)
    mobiCache = await loadMobiCache(config)

  const baseName = getBasename(filePath)
  const normalized = normalizeSerial(baseName)

  return (
    mobiCache.originals.has(baseName) || mobiCache.normalized.has(normalized)
  )
}

export const moveToKindle = async (config: Config, mobiPath: string) => {
  if (!(await isExist(mobiPath)))
    throw new Error(`mobi output not found: '${mobiPath}'`)

  const basename = getBasename(mobiPath)
  await copy(mobiPath, config.documents)
  if (mobiCache?.documents !== config.documents)
    mobiCache = await loadMobiCache(config)

  mobiCache.originals.add(basename)
  mobiCache.normalized.add(normalizeSerial(basename))
}
