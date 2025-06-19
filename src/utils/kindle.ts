import { copy, echo, getBasename, glob, isExist } from 'fire-keeper'

import type { Config } from '../core/config.js'

let mobiCache = ''

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
  if (!mobiCache) {
    const mobiFiles = await glob(`${config.documents}/*.mobi`)
    mobiCache = mobiFiles.map((path) => getBasename(path)).join(', ')
  }

  return mobiCache.includes(getBasename(filePath))
}

export const moveToKindle = async (config: Config, filePath: string) => {
  const basename = getBasename(filePath)
  await copy(`${config.temp}/${basename}.mobi`, config.documents)
}
