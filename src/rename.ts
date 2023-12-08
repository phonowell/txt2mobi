import { exec, getBasename, glob, read, remove, write } from 'fire-keeper'

import { isWindows, path } from './const'
import { formatPathForWindows, makeNewName } from './fn'

// function

const renameManga = async () => {
  const listSource = await glob([`${path.storage}/*`, `!${path.storage}/*.txt`])

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

const renameNovel = async () => {
  const listSource = await glob(`${path.storage}/*.txt`)

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
