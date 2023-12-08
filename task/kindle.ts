import convert, { removeUselessFile } from '../src'

// function

const main = async () => {
  await convert()
  await removeUselessFile()
}

// export
export default main
