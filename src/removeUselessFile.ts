import { getBasename, glob, remove } from 'fire-keeper'

import { Config } from './loadConfig'

// functions

const removeUselessFile = async (config: Config) => {
  await removeUselessMobi(config)
  await removeUselessSdr(config)
}

const removeUselessMobi = async (config: Config) => {
  const listManga = (
    await glob(`${config.mangaStorage}/*`, { onlyDirectories: true })
  ).map(getBasename)
  const listNovel = (await glob(`${config.novelStorage}/*.txt`)).map(
    getBasename,
  )
  const listMobi = (await glob(`${config.documents}/*.mobi`)).map(getBasename)

  const listResult = listMobi
    .map(it =>
      listManga.includes(it) || listNovel.includes(it.replace(/-\d+/, ''))
        ? ''
        : it,
    )
    .filter(it => !!it)
    .map(it => `${config.documents}/${it}.mobi`)

  if (!listResult.length) return
  await remove(listResult)
}

const removeUselessSdr = async (config: Config) => {
  const listMobi = (await glob(`${config.documents}/*.mobi`)).map(getBasename)
  const listSdr = (
    await glob(`${config.documents}/*.sdr`, { onlyFiles: false })
  ).map(getBasename)

  const listResult = listSdr
    .map(it => (listMobi.includes(it) ? '' : it))
    .filter(it => !!it)
    .map(it => `${config.documents}/${it}.sdr`)

  if (!listResult.length) return
  await remove(listResult)
}

// export
export default removeUselessFile
