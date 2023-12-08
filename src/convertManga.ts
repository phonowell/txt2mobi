import { glob } from 'fire-keeper'

import { isWindows } from './const'
import { image2html, html2mobi } from './convert'
import { checkIsExisted, moveToKindle, removeTemp } from './utils'
import { renameManga } from './rename'
import { Config } from './loadConfig'

// function

const convertManga = async (config: Config) => {
  if (!isWindows) return

  await renameManga(config)

  const listManga = await glob([
    `${config.storage}/manga/*`,
    `!${config.storage}/*.txt`,
  ])

  for (const manga of listManga) {
    if (await checkIsExisted(config, manga)) continue
    await image2html(config, manga)
    await html2mobi(config, manga)
    await moveToKindle(config, manga)
  }

  await removeTemp(config)
}

// export
export default convertManga
