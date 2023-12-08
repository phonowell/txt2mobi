import {
  copy,
  echo,
  getBasename,
  glob,
  isExist,
  read,
  remove,
  write,
} from 'fire-keeper'
import iconv from 'iconv-lite'
import chunk from 'lodash/chunk'

import { Config } from './loadConfig'

// variable

let cacheMobiName = ''

// functions

const checkIsExisted = async (config: Config, source: string) => {
  // fill
  if (!cacheMobiName) {
    const listSource = await glob(`${config.document}/*.mobi`)
    cacheMobiName = listSource.map(src => getBasename(src)).join(', ')
  }

  return cacheMobiName.includes(getBasename(source))
}

const convertEncoding = async (config: Config) => {
  const listSource = await glob(`${config.storage}/*.txt`)

  for (const source of listSource) {
    const content = await read<string>(source)
    if (!content) continue
    if (~content.search(/我/u)) continue

    const content2 = await read(source, { raw: true })
    if (!content2) continue

    const buffer = iconv.encode(iconv.decode(content2, 'gb2312'), 'utf-8')
    await write(source, buffer)
  }
}

const formatPathForWindows = (input: string) =>
  input.replace(/\[/g, '`[').replace(/\]/g, '`]')

const makeNewName = (name: string) =>
  name
    .replace(/,/g, '，')
    .replace(/:/g, '：')
    .replace(/</g, '《')
    .replace(/>/g, '》')
    .replace(/!/g, '！')
    .replace(/\(/g, '（')
    .replace(/\)/g, '）')
    .replace(/\[/g, '【')
    .replace(/\]/g, '】')

const moveToKindle = async (config: Config, source: string) => {
  const basename = getBasename(source)
  await copy(`${config.temp}/${basename}.mobi`, config.document)
}

const removeTemp = (config: Config) => remove(config.temp)

const splitTxt = async (config: Config, source: string) => {
  const basename = getBasename(source)
  const content = await read<string>(source)
  if (!content) throw new Error(`found no content in '${source}'`)

  const listGroup = chunk(
    content.replace(/\r/g, '').split('\n'),
    config.fileSize,
  )

  let idx = 1
  const listSource = []
  for (const listContent of listGroup) {
    const target = `${config.temp}/${basename}-${idx
      .toString()
      .padStart(2, '0')}.txt`
    await write(target, listContent.join('\n'))
    idx++
    listSource.push(target)
  }

  return listSource
}

const validateEnvironment = async (config: Config) => {
  if (!(await isExist(config.kindlegen))) {
    echo(
      "found no 'kindlegen', run 'brew cask install kindlegen' to install it",
    )
    return false
  }

  if (!(await isExist(config.document))) {
    echo(`found no '${config.document}', kindle must be connected`)
    return false
  }

  return true
}

// export
export {
  checkIsExisted,
  convertEncoding,
  formatPathForWindows,
  makeNewName,
  moveToKindle,
  removeTemp,
  splitTxt,
  validateEnvironment,
}
