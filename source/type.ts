export type Config = Record<'' | 'macos' | 'windows' | 'unknown', ItemConfig>

export type ItemConfig = {
  document: string
  fileSize: number
  kindlegen: string
  storage: string
}

export type Path = {
  document: string
  kindlegen: string
  storage: string
  temp: string
}
