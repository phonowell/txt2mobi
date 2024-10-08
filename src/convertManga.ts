import { Jimp } from 'jimp'
import { getBasename, glob, write } from 'fire-keeper'

import { checkIsExist, html2mobi, moveToKindle, removeTemp } from './utils'
import { renameManga } from './rename'
import { Config } from './loadConfig'
import { htmlContainer } from './const'

// function

const convertManga = async (config: Config) => {
  await renameManga(config)

  const listSource = await glob(`${config.mangaStorage}/*`, {
    onlyDirectories: true,
  })

  for (const source of listSource) {
    if (await checkIsExist(config, source)) continue
    await image2html(config, source)
    await html2mobi(config, source)
    await moveToKindle(config, source)
  }

  await removeTemp(config)
}

const image2html = async (config: Config, source: string) => {
  const basename = getBasename(source)
  const target = `${config.temp}/${basename}.html`

  const listSource = (await glob(`${source}/*.jpg`)).sort((a, b) => {
    const nameA = getBasename(a)
    const nameB = getBasename(b)
    return nameA.localeCompare(nameB)
  })

  const listResult: string[] = []
  for (const source of listSource) {
    const image = await Jimp.read(source)
    if (image.width > image.height) image.rotate(90)

    const { width } = image
    if (width > config.mangaMaxWidth)
      image.resize({
        w: config.mangaMaxWidth,
      })

    image.greyscale()

    const buffer = await image.getBuffer('image/jpeg', {
      quality: config.mangaQuality,
    })
    const html = `<p><img alt='' src='data:image/jpeg;base64,${buffer.toString(
      'base64',
    )}'></p>`

    listResult.push(html)
  }
  if (!listResult.length) return

  const content = htmlContainer.replace('{{content}}', listResult.join('\n'))
  await write(target, content)
}

// export
export default convertManga
