import { exec, getBasename, glob, read, remove, write } from 'fire-keeper'

import { isWindows } from './const'
import { Config } from './loadConfig'

// functions

const formatPathForWindows = (input: string) =>
  input.replace(/\[/g, '`[').replace(/\]/g, '`]')

const makeNewName = (name: string) =>
  name
    .replace(/!/g, '！')
    .replace(/,/g, '，')
    .replace(/:/g, '：')
    .replace(/\?/g, '？')

    // remove (xxx)
    .replace(/\(.*?\)/g, '')
    // remove [xxx]
    .replace(/\[.*?\]/g, '')
    // remove {xxx}
    .replace(/\{.*?\}/g, '')
    // remove <xxx>
    .replace(/<.*?>/g, '')

    .replace(/\s{2,}/, ' ')
    .trim()

const renameManga = async (config: Config) => {
  const listSource = await glob(`${config.mangaStorage}/*`, {
    onlyDirectories: true,
  })

  for (const source of listSource) {
    const basename = getBasename(source)
    const basename2 = makeNewName(basename)
    if (basename2 === basename) continue

    const src = source.replace(basename, basename2)

    const line = isWindows
      ? `ren '${formatPathForWindows(source)}' '${basename2}'`
      : `mv "${source}" "${src}"`

    await exec(line)
  }
}

const renameNovel = async (config: Config) => {
  const listSource = await glob(`${config.novelStorage}/*.txt`)

  for (const source of listSource) {
    const basename = getBasename(source)
    const basename2 = makeNewName(basename)
    if (basename2 === basename) continue

    const src = source.replace(/[[\]]/g, '*')
    const content = await read(src)
    await remove(src)
    await write(source.replace(basename, basename2), content)
  }
}

// export
export { renameManga, renameNovel }
