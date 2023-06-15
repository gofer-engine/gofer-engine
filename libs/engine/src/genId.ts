import { randomUUID } from 'crypto'
import cache from './cache'

const ids = new cache({
  base: `${__dirname}/../.cache`,
  name: 'ids',
})
let idIndex = 0

export const genId = () => {
  idIndex++
  let id: string | undefined = undefined
  try {
    id = ids.getSync(idIndex.toString())
  } catch (_e: unknown) {
    // ignore
  }
  if (id) return id
  const newId = randomUUID()
  ids.putSync(idIndex.toString(), newId)
  return newId
}
