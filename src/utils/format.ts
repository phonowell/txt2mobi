import { getBasename } from 'fire-keeper'

// 按文件名排序
export const sortByBasename = (paths: string[]) =>
  paths.sort((a, b) => {
    const nameA = getBasename(a)
    const nameB = getBasename(b)
    return nameA.localeCompare(nameB)
  })

// 文本格式化
export const formatHtmlLines = (content: string) =>
  content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .split('\n')
    .map((line) => {
      const trimmedLine = line.trim()
      return trimmedLine ? `<p>${trimmedLine}</p>` : ''
    })
    .filter((line) => line)
