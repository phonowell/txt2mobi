import { os, read } from 'fire-keeper'

export type Config = {
  documents: string
  kindlegen: string
  mangaMaxWidth: number
  mangaQuality: number
  mangaStorage: string
  novelFileSize: number
  novelStorage: string
  temp: string
}

type FileConfig = {
  basic: {
    documents: string | Record<string, string>
    kindlegen: string | Record<string, string>
  }
  manga: {
    storage: string | Record<string, string>
    maxWidth: number
    quality: number
  }
  novel: {
    storage: string | Record<string, string>
    fileSize: number
  }
}

const selectPath = (input: string | Record<string, string>) =>
  typeof input === 'string' ? input : input[os()]

export const loadConfig = async (): Promise<Config> => {
  const file = await read<FileConfig>('config.yaml')
  if (!file) throw new Error('config.yaml not found')

  return {
    documents: selectPath(file.basic.documents),
    kindlegen: selectPath(file.basic.kindlegen),
    mangaMaxWidth: file.manga.maxWidth,
    mangaQuality: file.manga.quality,
    mangaStorage: selectPath(file.manga.storage),
    novelFileSize: file.novel.fileSize,
    novelStorage: selectPath(file.novel.storage),
    temp: './temp/kindle',
  }
}
