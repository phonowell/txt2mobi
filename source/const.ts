import { os } from 'fire-keeper'

import { Path } from './type'

// variable

export const fileSize = 2000

export const path: Path = {"document":"/Volumes/Kindle/documents","kindlegen":"~/OneDrive/程序/kindlegen/kindlegen","storage":"~/OneDrive/书籍/同步","temp":"./temp/kindle"} as const

export const htmlContainer = [
  '<html lang="zh-cmn-Hans">',
  '<head>',
  '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>',
  '</head>',
  '<body>',
  '{{content}}',
  '</body>',
  '</html>',
].join('')

export const isWindows = os() === 'windows'
