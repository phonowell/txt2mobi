import { run } from 'fire-keeper'

import { loadConfig } from './core/config.js'
import { convertManga, convertNovel } from './core/converter.js'
import { removeOrphaned } from './utils/file.js'
import { validateEnv } from './utils/kindle.js'

run(async () => {
  const config = await loadConfig()

  if (!(await validateEnv(config))) return

  await convertManga(config)
  await convertNovel(config)

  await removeOrphaned(config)
})
