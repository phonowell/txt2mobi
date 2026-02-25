import { describe, expect, it, vi } from 'vitest'

vi.mock('fire-keeper', () => ({
  getBasename: (path: string) => path.split('/').pop() ?? '',
}))

describe('format utils', () => {
  it('sortByBasename should use natural order for numeric suffixes', async () => {
    const { sortByBasename } = await import('../src/utils/format.js')
    const result = sortByBasename(['/a/1.jpg', '/a/10.jpg', '/a/2.jpg'])
    expect(result).toEqual(['/a/1.jpg', '/a/2.jpg', '/a/10.jpg'])
  })

  it('formatHtmlLines should escape html-sensitive characters', async () => {
    const { formatHtmlLines } = await import('../src/utils/format.js')
    const lines = formatHtmlLines('1 < 2 & 3\n<script>alert(1)</script>')
    expect(lines).toEqual([
      '<p>1 &lt; 2 &amp; 3</p>',
      '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>',
    ])
  })
})
