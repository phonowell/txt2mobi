import { normalizePath, os, read } from 'fire-keeper'

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

const selectPath = (input: string | Record<string, string>, field: string) => {
  if (typeof input === 'string') return input

  const platform = os()
  const value = input[platform]
  if (!value) {
    throw new Error(
      `missing config path for '${field}' on platform '${platform}'`,
    )
  }

  return value
}

const resolvePath = (input: string | Record<string, string>, field: string) =>
  normalizePath(selectPath(input, field))

export const loadConfig = async (): Promise<Config> => {
  const file = await read<FileConfig>('config.yaml')
  if (!file) throw new Error('config.yaml not found')
  return {
    documents: resolvePath(file.basic.documents, 'basic.documents'),
    kindlegen: resolvePath(file.basic.kindlegen, 'basic.kindlegen'),
    mangaMaxWidth: file.manga.maxWidth,
    mangaQuality: file.manga.quality,
    mangaStorage: resolvePath(file.manga.storage, 'manga.storage'),
    novelFileSize: file.novel.fileSize,
    novelStorage: resolvePath(file.novel.storage, 'novel.storage'),
    temp: normalizePath('./temp/kindle'),
  }
}
