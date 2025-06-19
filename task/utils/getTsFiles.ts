import { glob, run } from 'fire-keeper'

import parseCliArgs from './parseCliArgs.js'

const isValidTsFile = (path: string): boolean => {
  if (!path) return false
  if (path.endsWith('.d.ts')) return false
  return path.endsWith('.ts') || path.endsWith('.tsx')
}

const getTsFiles = async (listSource?: string | string[]): Promise<string[]> =>
  (
    await glob(
      await run(async () => {
        if (listSource) return listSource

        const args = await parseCliArgs()
        if (args.length) return args

        return './src/**/*.{ts,tsx}'
      }),
    )
  ).filter(isValidTsFile)

export default getTsFiles
