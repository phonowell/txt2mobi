import { glob } from 'fire-keeper'

import {
  cleanMangaNames,
  cleanNovelNames,
  cleanTempDir,
} from '../utils/file.js'
import { mobiExists, moveToKindle } from '../utils/kindle.js'

import {
  convertToMobi,
  fixEncoding,
  processImages,
  processText,
  splitText,
} from './processor.js'

import type { Config } from './config.js'

export const convertManga = async (config: Config) => {
  await cleanMangaNames(config)

  const sources = await glob(`${config.mangaStorage}/*`, {
    onlyDirectories: true,
  })

  for (const source of sources) {
    if (await mobiExists(config, source)) continue
    const htmlPath = await processImages(config, source)
    if (!htmlPath) continue
    const mobiPath = await convertToMobi(config, htmlPath)
    await moveToKindle(config, mobiPath)
  }

  await cleanTempDir(config)
}

export const convertNovel = async (config: Config) => {
  await cleanNovelNames(config)
  await fixEncoding(config)

  const novelFiles = await glob(`${config.novelStorage}/*.txt`)
  for (const file of novelFiles) {
    const splitFiles = await splitText(config, file)
    for (const splitFile of splitFiles) {
      if (await mobiExists(config, splitFile)) continue
      const htmlPath = await processText(config, splitFile)
      if (!htmlPath) continue
      const mobiPath = await convertToMobi(config, htmlPath)
      await moveToKindle(config, mobiPath)
    }
  }

  await cleanTempDir(config)
}
