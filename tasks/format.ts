import { exec } from 'fire-keeper'

import getTsFiles from './utils/getTsFiles.js'

const quote = (path: string) => `"${path.replace(/"/g, '\\"')}"`

const main = async (listSource?: string | string[]): Promise<void> => {
  const sources = await getTsFiles(listSource)
  if (!sources.length) return

  const quoted = sources.map(quote).join(' ')
  await exec([`oxlint --fix ${quoted}`, `oxfmt ${quoted}`])
}

export default main
