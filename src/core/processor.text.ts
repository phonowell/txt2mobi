// 文本处理相关
import { getBasename, read, write } from 'fire-keeper'

import { formatHtmlLines } from '../utils/format.js'

import type { Config } from './config.js'

const HTML_TEMPLATE = [
  '<html lang="zh-cmn-Hans">',
  '<head>',
  '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>',
  '</head>',
  '<body>',
  '{{content}}',
  '</body>',
  '</html>',
].join('')

export const processText = async (config: Config, filePath: string) => {
  const basename = getBasename(filePath)
  const target = `${config.temp}/${basename}.html`

  const content = await read<string>(filePath)
  if (!content) return

  const htmlLines = formatHtmlLines(content)

  const htmlContent = HTML_TEMPLATE.replace('{{content}}', htmlLines.join('\n'))
  await write(target, htmlContent)
}
