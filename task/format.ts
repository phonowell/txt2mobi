import { ESLint } from 'eslint'

import getTsFiles from './utils/getTsFiles.js'

const main = async (listSource?: string | string[]): Promise<void> => {
  const sources = await getTsFiles(listSource)
  if (!sources.length) return

  const eslint = new ESLint({
    fix: true,
  })

  const results = await eslint.lintFiles(sources)

  await ESLint.outputFixes(results)
}

export default main
