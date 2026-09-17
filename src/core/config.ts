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

const requireNumber = (value: unknown, field: string) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0)
    throw new Error(`invalid config: '${field}' must be a positive number`)
  return value
}

export const loadConfig = async (): Promise<Config> => {
  const file = await read<Partial<FileConfig>>('config.yaml')
  if (!file) throw new Error('config.yaml not found')

  const { basic, manga, novel } = file
  if (
    !basic ||
    !manga ||
    !novel ||
    !basic.documents ||
    !basic.kindlegen ||
    !manga.storage ||
    !novel.storage
  )
    throw new Error('invalid config: missing required field(s)')

  return {
    documents: resolvePath(basic.documents, 'basic.documents'),
    kindlegen: resolvePath(basic.kindlegen, 'basic.kindlegen'),
    mangaMaxWidth: requireNumber(manga.maxWidth, 'manga.maxWidth'),
    mangaQuality: requireNumber(manga.quality, 'manga.quality'),
    mangaStorage: resolvePath(manga.storage, 'manga.storage'),
    novelFileSize: requireNumber(novel.fileSize, 'novel.fileSize'),
    novelStorage: resolvePath(novel.storage, 'novel.storage'),
    temp: normalizePath('./temp/kindle'),
  }
}
