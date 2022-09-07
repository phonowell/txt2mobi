import $ from 'fire-keeper'
import { checkIsExisted, moveToKindle, removeTemp } from './fn'
import { image2html, html2mobi } from './convert'
import { isWindows, path } from './const'
import { renameManga } from './rename'

// function

const main = async () => {
  if (!isWindows) return

  await renameManga()

  const listManga = await $.glob([
    `${path.storage}/manga/*`,
    `!${path.storage}/*.txt`,
  ])

  for (const manga of listManga) {
    if (await checkIsExisted(manga)) continue
    await image2html(manga)
    await html2mobi(manga)
    await moveToKindle(manga)
  }

  await removeTemp()
}

// export
export default main
