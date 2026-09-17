import { glob, runConcurrent } from 'fire-keeper'

import { cleanMangaNames, cleanNovelNames } from '../utils/file.js'
import { mobiExists, moveToKindle } from '../utils/kindle.js'

import {
  convertToMobi,
  fixEncoding,
  processImages,
  processText,
  splitText,
} from './processor.js'

import type { Config } from './config.js'

const BOOK_CONCURRENCY = 3

const toKindle = async (config: Config, htmlPath: string | null) => {
  if (!htmlPath) return
  const mobiPath = await convertToMobi(config, htmlPath)
  await moveToKindle(config, mobiPath)
}

export const convertManga = async (config: Config) => {
  await cleanMangaNames(config)

  const sources = await glob(`${config.mangaStorage}/*`, {
    onlyDirectories: true,
  })

  await runConcurrent(
    BOOK_CONCURRENCY,
    sources.map((source) => async () => {
      if (await mobiExists(config, source)) return
      const htmlPath = await processImages(config, source)
      await toKindle(config, htmlPath)
    }),
  )
}

export const convertNovel = async (config: Config) => {
  await cleanNovelNames(config)
  await fixEncoding(config)

  const novelFiles = await glob(`${config.novelStorage}/*.txt`)
  const splitFiles = (
    await Promise.all(novelFiles.map((file) => splitText(config, file)))
  ).flat()

  await runConcurrent(
    BOOK_CONCURRENCY,
    splitFiles.map((file) => async () => {
      if (await mobiExists(config, file)) return
      const htmlPath = await processText(config, file)
      await toKindle(config, htmlPath)
    }),
  )
}
