import {
  echo,
  getDirname,
  getExtname,
  isExist,
  run,
  runConcurrent,
} from 'fire-keeper'
import { Project } from 'ts-morph'

import format from './format.js'
import getTsFiles from './utils/getTsFiles.js'

import type { SourceFile, StringLiteral } from 'ts-morph'

const EXTS = ['.ts', '.tsx', '.js', '.jsx']

/** Check if file exists with any supported extension */
const findExt = async (path: string): Promise<string | null> => {
  for (const ext of EXTS) if (await isExist(`${path}${ext}`)) return ext
  return null
}

/** Check if import is relative */
const isRelative = (path: string): boolean =>
  path.startsWith('../') || path.startsWith('./') || path.startsWith('@/')

/** Process import/export module specifier */
const processSpec = async (
  spec: StringLiteral,
  filePath: string,
  type: 'import' | 'export',
): Promise<boolean> => {
  const path = spec.getLiteralValue()

  if (!isRelative(path) || !!getExtname(path)) return false

  const foundExt = await findExt(
    path.startsWith('@')
      ? path.replace('@', './src')
      : `${getDirname(filePath)}/${path}`,
  )

  if (foundExt) {
    const importExt = run(() => {
      if (foundExt === '.ts' || foundExt === '.tsx')
        return foundExt === '.ts' ? '.js' : '.jsx'

      return foundExt
    })

    const newPath = `${path}${importExt}`
    spec.setLiteralValue(newPath)
    echo('success', `✅ '${path}' → '${newPath}' in '${filePath}'`)
    return true
  }

  echo('warn', `⚠️ Cannot find file for '${type}': '${path}' in '${filePath}'`)
  return false
}

/** Fix import extensions in file */
const fixFile = async (file: SourceFile): Promise<boolean> => {
  const filePath = file.getFilePath()
  let changed = false

  for (const imp of file.getImportDeclarations()) {
    if (await processSpec(imp.getModuleSpecifier(), filePath, 'import'))
      changed = true
  }

  for (const exp of file.getExportDeclarations()) {
    const spec = exp.getModuleSpecifier()
    if (spec && (await processSpec(spec, filePath, 'export'))) changed = true
  }

  return changed
}

/** Analyze and fix single file */
const analyze = async (filePath: string): Promise<string> => {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json',
    skipAddingFilesFromTsConfig: true,
  })

  project.addSourceFileAtPath(filePath)
  const file = project.getSourceFileOrThrow(filePath)
  const changed = await fixFile(file)

  if (!changed) return ''

  await file.save()
  return filePath
}

/** Main function */
const main = async (src?: string | string[]): Promise<void> => {
  echo('info', '🔧 Starting import extensions fix...')

  const files = await getTsFiles(src)
  if (!files.length) {
    echo('info', '📁 No TypeScript files found.')
    return
  }

  echo('info', `📁 Found '${files.length}' TypeScript files to process.`)

  const tasks = files.map((f) => () => analyze(f))
  const changed = (await runConcurrent(5, tasks)).filter(Boolean)

  if (changed.length > 0) {
    echo('info', `✨ Fixed '${changed.length}' files, formatting...`)
    await format(changed)
    echo('success', '🎉 All done!')
  } else echo('info', '✨ No files needed fixing.')
}

export default main
