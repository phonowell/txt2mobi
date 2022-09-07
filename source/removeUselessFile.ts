import $ from 'fire-keeper'
import { path } from './const'
import { validateEnvironment } from './fn'

// function

const removeUselessFile = async () => {
  if (!(await validateEnvironment())) return
  await removeUselessMobi()
  await removeUselessSdr()
}

const removeUselessMobi = async () => {
  const listTxt = (await $.glob(`${path.storage}/*.txt`)).map($.getBasename)
  const listMobi = (await $.glob(`${path.document}/*.mobi`)).map($.getBasename)

  const listResult = listMobi
    .map(it => (listTxt.includes(it.replace(/-\d+/, '')) ? '' : it))
    .filter(it => !!it)
    .map(it => `${path.document}/${it}.mobi`)

  if (!listResult.length) return
  await $.remove(listResult)
}

const removeUselessSdr = async () => {
  const listMobi = (await $.glob(`${path.document}/*.mobi`)).map($.getBasename)
  const listSdr = (
    await $.glob(`${path.document}/*.sdr`, { onlyFiles: false })
  ).map($.getBasename)

  const listResult = listSdr
    .map(it => (listMobi.includes(it) ? '' : it))
    .filter(it => !!it)
    .map(it => `${path.document}/${it}.sdr`)

  if (!listResult.length) return
  await $.remove(listResult)
}

// export
export default removeUselessFile
