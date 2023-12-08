import { exec, getBasename, glob, read, write } from 'fire-keeper'

import { isWindows, htmlContainer } from './const'
import { Config } from './loadConfig'

// functions

const html2mobi = async (config: Config, source: string) => {
  const basename = getBasename(source)
  const target = isWindows
    ? `${config.temp}/${basename}.html`
    : `"${config.temp}/${basename}.html"`

  const cmd = [
    config.kindlegen,
    `${target}`,
    '-c1',
    '-dont_append_source',
  ].join(' ')

  await exec(cmd)
}

const image2html = async (config: Config, source: string) => {
  const basename = getBasename(source)
  const target = `${config.temp}/${basename}.html`

  const listImage = await glob(`${source}/*.jpg`)

  const listResult: string[] = []
  for (const img of listImage) {
    const buffer = await read(img)
    if (!buffer) continue
    const html = `<p><img alt='' src='data:image/jpeg;base64,${buffer.toString(
      'base64',
    )}'></p>`
    listResult.push(html)
  }

  const content = htmlContainer.replace('{{content}}', listResult.join('\n'))
  await write(target, content)
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
export { html2mobi, image2html, txt2html }
