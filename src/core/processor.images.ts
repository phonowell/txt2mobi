// 图片处理相关
import { getBasename, glob, write } from 'fire-keeper'
import { Jimp } from 'jimp'

import { sortByBasename } from '../utils/format.js'

import type { Config } from './config.js'

const HTML_TEMPLATE = [
  '<html lang="zh-cmn-Hans">',
  '<head>',
  '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>',
  '</head>',
  '<body>',
  '{{content}}',
  '</body>',
  '</html>',
].join('')

const buildImageHtml = async (config: Config, imagePath: string) => {
  const image = await Jimp.read(imagePath)
  if (image.width > image.height) image.rotate(90)

  if (image.width > config.mangaMaxWidth)
    image.resize({ w: config.mangaMaxWidth })

  image.greyscale()

  const buffer = await image.getBuffer('image/jpeg', {
    quality: config.mangaQuality,
  })

  return `<p><img alt='' src='data:image/jpeg;base64,${buffer.toString('base64')}'></p>`
}

export const processImages = async (config: Config, source: string) => {
  const basename = getBasename(source)
  const target = `${config.temp}/${basename}.html`

  const imagePaths = sortByBasename(await glob(`${source}/*.jpg`))
  const htmlElements = await Promise.all(
    imagePaths.map((imagePath) => buildImageHtml(config, imagePath)),
  )

  if (!htmlElements.length) return

  const content = HTML_TEMPLATE.replace('{{content}}', htmlElements.join('\n'))
  await write(target, content)
}
