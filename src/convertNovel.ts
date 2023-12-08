import { glob } from 'fire-keeper'

import { txt2html, html2mobi } from './convert'
import {
  convertEncoding,
  splitTxt,
  moveToKindle,
  removeTemp,
  checkIsExisted,
} from './utils'
import { renameNovel } from './rename'
import { Config } from './loadConfig'

// function

const convertNovel = async (config: Config) => {
  await renameNovel(config)
  await convertEncoding(config)

  const listNovel = await glob(`${config.storage}/*.txt`)
  for (const novel of listNovel) {
    if (await checkIsExisted(config, novel)) continue
    const listSrc = await splitTxt(config, novel)
    for (const src of listSrc) {
      await txt2html(config, src)
      await html2mobi(config, src)
      await moveToKindle(config, src)
    }
  }

  await removeTemp(config)
}

// export
export default convertNovel
