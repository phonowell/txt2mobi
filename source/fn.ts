import $ from 'fire-keeper'
import chunk from 'lodash/chunk'
import iconv from 'iconv-lite'
import { fileSize, path } from './const'

// variable

let cacheMobiName = ''

// function

const checkIsExisted = async (source: string) => {
  // fill
  if (!cacheMobiName) {
    const listSource = await $.glob(`${path.document}/*.mobi`)
    cacheMobiName = listSource.map(src => $.getBasename(src)).join(', ')
  }

  return cacheMobiName.includes($.getBasename(source))
}

const convertEncoding = async () => {
  const listSource = await $.glob(`${path.storage}/*.txt`)

  for (const source of listSource) {
    const content = await $.read<string>(source)
    if (~content.search(/我/u)) continue

    const buffer = iconv.encode(
      iconv.decode(await $.read(source, { raw: true }), 'gb2312'),
      'utf-8'
    )
    await $.write(source, buffer)
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

const moveToKindle = async (source: string) => {
  const basename = $.getBasename(source)
  await $.copy(`${path.temp}/${basename}.mobi`, path.document)
}

const removeTemp = () => $.remove(path.temp)

const splitTxt = async (source: string) => {
  const basename = $.getBasename(source)
  const listGroup = chunk(
    (await $.read<string>(source)).replace(/\r/g, '').split('\n'),
    fileSize
  )

  let idx = 1
  const listSource = []
  for (const listContent of listGroup) {
    const target = `${path.temp}/${basename}-${idx
      .toString()
      .padStart(2, '0')}.txt`
    await $.write(target, listContent.join('\n'))
    idx++
    listSource.push(target)
  }

  return listSource
}

const validateEnvironment = async () => {
  if (!(await $.isExisted(path.kindlegen))) {
    $.log(
      "found no 'kindlegen', run 'brew cask install kindlegen' to install it"
    )
    return false
  }

  if (!(await $.isExisted(path.document))) {
    $.log(`found no '${path.document}', kindle must be connected`)
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
