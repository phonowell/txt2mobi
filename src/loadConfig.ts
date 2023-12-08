import { read, at, os } from 'fire-keeper'

// interface

type Config = {
  document: string
  fileSize: number
  kindlegen: string
  storage: string
  temp: string
}

type FileConfig = {
  macos: Omit<Config, 'temp'>
  windows: Omit<Config, 'temp'>
}

// function

const loadConfig = async (): Promise<Config> => {
  const file = await read<FileConfig>('config.yaml')
  if (!file) throw new Error('config.yaml not found')

  const config = at(file, os())
  if (!config) throw new Error(`config.yaml: ${os()} not found`)

  return { ...config, temp: './temp/kindle' }
}

// export
export default loadConfig
export type { Config }
