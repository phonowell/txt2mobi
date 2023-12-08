import { glob } from 'fire-keeper'

import { path } from './const'
import { txt2html, html2mobi } from './convert'
import {
  convertEncoding,
  splitTxt,
  moveToKindle,
  removeTemp,
  checkIsExisted,
} from './fn'
import { renameNovel } from './rename'

// function

const main = async () => {
  await renameNovel()
  await convertEncoding()

  const listNovel = await glob(`${path.storage}/*.txt`)
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
