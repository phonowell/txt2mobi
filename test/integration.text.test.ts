// 真实 fs 集成测试：txt -> html（不 mock fire-keeper）
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import { processText } from '../src/core/processor.text.js'

import type { Config } from '../src/core/config.js'

let dir = ''

const config = async () => {
  dir = await mkdtemp(join(tmpdir(), 'txt2mobi-'))
  return {
    documents: dir,
    kindlegen: '/bin/kindlegen',
    mangaMaxWidth: 1280,
    mangaQuality: 80,
    mangaStorage: dir,
    novelFileSize: 100,
    novelStorage: dir,
    temp: dir,
  } satisfies Config
}

afterAll(async () => {
  if (dir) await rm(dir, { force: true, recursive: true })
})

describe('processText 集成', () => {
  it('应生成含转义与模板包裹的 html 文件', async () => {
    const cfg = await config()
    const txtPath = join(dir, '小说.txt')
    await writeFile(
      txtPath,
      '第一章 <标题> & "引号"\n\n![封面](a.png)\n第二行',
      'utf-8',
    )

    const target = await processText(cfg, txtPath)

    expect(target).toBe(join(dir, '小说.html'))
    const html = await readFile(target as string, 'utf-8')
    expect(html).toContain('lang="zh-cmn-Hans"')
    expect(html).toContain('<p>第一章 &lt;标题&gt; &amp; &quot;引号&quot;</p>')
    expect(html).toContain('<p>第二行</p>')
    expect(html).not.toContain('封面')
  })

  it('空文件应返回 null 且不产生 html', async () => {
    const cfg = await config()
    const txtPath = join(dir, '空.txt')
    await writeFile(txtPath, '  \n\n', 'utf-8')

    const target = await processText(cfg, txtPath)

    expect(target).toBeNull()
  })
})
