import { argv } from 'fire-keeper'

const parseCliArgs = async () =>
  (await argv())._.slice(1).map((it) => it.toString())

export default parseCliArgs
