import chunk from 'lodash/chunk'
import iconv from 'iconv-lite'
import { getBasename, glob, read, write } from 'fire-keeper'

import { Config } from './loadConfig'
import { moveToKindle, removeTemp, checkIsExist, html2mobi } from './utils'
import { renameNovel } from './rename'
import { htmlContainer } from './const'

// functions

const convertEncoding = async (config: Config) => {
  const listSource = await glob(`${config.novelStorage}/*.txt`)

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

const convertNovel = async (config: Config) => {
  await renameNovel(config)
  await convertEncoding(config)

  const listSource = await glob(`${config.novelStorage}/*.txt`)
  for (const source of listSource) {
    if (await checkIsExist(config, source)) continue
    const listSrc = await splitTxt(config, source)
    for (const src of listSrc) {
      await txt2html(config, src)
      await html2mobi(config, src)
      await moveToKindle(config, src)
    }
  }

  await removeTemp(config)
}

const splitTxt = async (config: Config, source: string) => {
  const basename = getBasename(source)
  const content = await read<string>(source)
  if (!content) throw new Error(`found no content in '${source}'`)

  const listGroup = chunk(
    content.replace(/\r/g, '').split('\n'),
    config.novelFileSize,
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

const txt2html = async (config: Config, source: string) => {
  const basename = getBasename(source)
  const target = `${config.temp}/${basename}.html`

  const content = await read<string>(source)
  if (!content) return

  const listContent = content
    .split('\n')
    .map(l => {
      const line = l.trim()
      return line ? `<p>${line}</p>` : ''
    })
    .filter(it => it)

  const result = htmlContainer.replace('{{content}}', listContent.join('\n'))
  await write(target, result)
}

// export
export default convertNovel
