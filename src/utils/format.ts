import { getBasename } from 'fire-keeper'

const BASENAME_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// 按文件名排序
export const sortByBasename = (paths: string[]) =>
  paths.sort((a, b) => {
    const nameA = getBasename(a)
    const nameB = getBasename(b)
    return BASENAME_COLLATOR.compare(nameA, nameB)
  })

// 文本格式化
export const formatHtmlLines = (content: string) =>
  content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .split('\n')
    .map((line) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return ''
      return `<p>${escapeHtml(trimmedLine)}</p>`
    })
    .filter(Boolean)
