#!/usr/bin/env node

import { run } from 'fire-keeper'

import { loadConfig } from './core/config.js'
import { convertManga, convertNovel } from './core/converter.js'
import { cleanTempDir, removeOrphaned } from './utils/file.js'
import { validateEnv } from './utils/kindle.js'

run(async () => {
  const config = await loadConfig()

  if (!(await validateEnv(config))) return

  await Promise.all([convertManga(config), convertNovel(config)])

  await cleanTempDir(config)
  await removeOrphaned(config)
})
