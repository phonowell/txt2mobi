import $ from 'fire-keeper'
import {
  convertEncoding,
  splitTxt,
  moveToKindle,
  removeTemp,
  checkIsExisted,
} from './fn'
import { path } from './const'
import { renameNovel } from './rename'
import { txt2html, html2mobi } from './convert'

// function

const main = async () => {
  await renameNovel()
  await convertEncoding()

  const listNovel = await $.glob(`${path.storage}/*.txt`)
  for (const novel of listNovel) {
    if (await checkIsExisted(novel)) continue
    const listSrc = await splitTxt(novel)
    for (const src of listSrc) {
      await txt2html(src)
      await html2mobi(src)
      await moveToKindle(src)
    }
  }

  await removeTemp()
}

// export
export default main
