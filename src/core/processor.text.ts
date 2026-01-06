// 文本处理相关
import { getBasename, read, write } from 'fire-keeper'

import { HTML_TEMPLATE } from '../constants/html.js'
import { formatHtmlLines } from '../utils/format.js'

import type { Config } from './config.js'

export const processText = async (config: Config, filePath: string) => {
  const basename = getBasename(filePath)
  const target = `${config.temp}/${basename}.html`

  const content = await read<string>(filePath)
  if (!content) return

  const htmlLines = formatHtmlLines(content)

  const htmlContent = HTML_TEMPLATE.replace('{{content}}', htmlLines.join('\n'))
  await write(target, htmlContent)
}
