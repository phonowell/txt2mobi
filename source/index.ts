// import convertManga from './convertManga'
import convertNovel from './convertNovel'
import { validateEnvironment } from './fn'
import removeUselessFile from './removeUselessFile'

// function

const main = async () => {
  if (!(await validateEnvironment())) return

  // await convertManga()
  await convertNovel()
}

// export
export default main
export { removeUselessFile }
