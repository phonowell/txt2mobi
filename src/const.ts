import { os } from 'fire-keeper'

// variables

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
