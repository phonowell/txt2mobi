// import convertManga from './convertManga'
import { run } from 'fire-keeper'

import convertNovel from './convertNovel'
import { validateEnvironment } from './utils'
import removeUselessFile from './removeUselessFile'
import loadConfig from './loadConfig'
import convertManga from './convertManga'

// function

run(async () => {
  const config = await loadConfig()

  if (!(await validateEnvironment(config))) return

  await convertManga(config)
  await convertNovel(config)

  await removeUselessFile(config)
})
