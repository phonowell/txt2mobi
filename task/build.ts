import $ from 'fire-keeper'

import { Config } from '../source/type'

// function

const main = async () => {
  const config = await $.read<Config>('config.yaml')
  if (!config) throw new Error('config.yaml not found')

  const cfg = config[$.os()]
  if (!cfg) throw new Error(`config.yaml: ${$.os()} not found`)
  const { fileSize, document, kindlegen, storage } = cfg

  const content = await $.read('source/const.ts')
  if (!content) throw new Error('source/const.ts not found')

  const result = content
    .replace(
      /export const fileSize = .*/,
      `export const fileSize = ${fileSize}`,
    )
    .replace(
      /export const path: Path = [\s\S]*? as const/,
      `export const path: Path = ${JSON.stringify({
        document,
        kindlegen,
        storage,
        temp: './temp/kindle',
      })} as const`,
    )

  await $.write('source/const.ts', result)
}

// export
export default main
