import { read, os } from 'fire-keeper'

// interface

type Config = {
  /** kindle设备中documents目录路径 */
  documents: string
  /** kindlegen路径 */
  kindlegen: string

  /** 漫画图片的最大宽度 */
  mangaMaxWidth: number
  /** 漫画图片质量 */
  mangaQuality: number
  /** 漫画仓库路径 */
  mangaStorage: string

  /** 小说单文件行数 */
  novelFileSize: number
  /** 小说仓库路径 */
  novelStorage: string

  /** 临时文件夹路径 */
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

// functions

const loadConfig = async (): Promise<Config> => {
  const file = await read<FileConfig>('config.yaml')
  if (!file) throw new Error('config.yaml not found')

  return {
    documents: pickPath(file.basic.documents),
    kindlegen: pickPath(file.basic.kindlegen),
    mangaMaxWidth: file.manga.maxWidth,
    mangaQuality: file.manga.quality,
    mangaStorage: pickPath(file.manga.storage),
    novelFileSize: file.novel.fileSize,
    novelStorage: pickPath(file.novel.storage),
    temp: './temp/kindle',
  }
}

const pickPath = (input: string | Record<string, string>) =>
  typeof input === 'string' ? input : input[os()]

// export
export default loadConfig
export type { Config }
