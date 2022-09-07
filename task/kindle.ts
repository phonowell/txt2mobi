import convert, { removeUselessFile } from '../source'

// function

const main = async () => {
  await convert()
  await removeUselessFile()
}

// export
export default main
