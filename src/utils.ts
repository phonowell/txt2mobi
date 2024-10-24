import {
  copy,
  echo,
  exec,
  getBasename,
  glob,
  isExist,
  remove,
} from 'fire-keeper'

import { Config } from './loadConfig'
import { isWindows } from './const'

// variable

let cacheMobiName = ''

// functions

const checkIsExist = async (config: Config, source: string) => {
  // fill
  if (!cacheMobiName) {
    const listSource = await glob(`${config.documents}/*.mobi`)
    cacheMobiName = listSource.map(src => getBasename(src)).join(', ')
  }

  return cacheMobiName.includes(getBasename(source))
}

const html2mobi = async (config: Config, source: string) => {
  const basename = getBasename(source)
  const target = isWindows
    ? `${config.temp}/${basename}.html`
    : `"${config.temp}/${basename}.html"`

  const cmd = [config.kindlegen, target, '-c1', '-dont_append_source'].join(' ')

  await exec(cmd)
}

const makeRandomId = () => Math.random().toString(36).substring(2, 15)

const moveToKindle = async (config: Config, source: string) => {
  const basename = getBasename(source)
  await copy(`${config.temp}/${basename}.mobi`, config.documents)
}

const removeTemp = (config: Config) => remove(config.temp)

const validateEnvironment = async (config: Config) => {
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

// export
export {
  checkIsExist,
  html2mobi,
  makeRandomId,
  moveToKindle,
  removeTemp,
  validateEnvironment,
}
