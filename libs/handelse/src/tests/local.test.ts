import { randomUUID } from 'node:crypto'
import handelse from '../'

const handler = handelse.createInstance<string>()

const storeArr: string[] = []
const storeObj: Record<string, string> = {}

handler.do(event => {
  storeArr.push(event)
  return true
})

handler.listen(event => {
  storeObj[event] = event
  return true
})

it('publish:foo', async () => {
  await handler.pub('foo')
  expect(storeArr.includes('foo')).toBe(true)
  expect(storeObj['foo']).toBe('foo')
})

it('publish:bar', async () => {
  await handler.pub('bar')
  expect(storeArr.includes('bar')).toBe(true)
  expect(storeObj['bar']).toBe('bar')
})

interface User {
  username: string
}

const mockStore: Record<string, User> = {}

const allPass = (res: Record<string, boolean>) =>
  Object.values(res).every(v => v)
const atLeastOne = (res: Record<string, boolean>) =>
  Object.values(res).length > 0

const main = async (user: User) =>
  new Promise<boolean>(async res => {
    const doCreate = handelse.createInstance<User>()
    const preCreate = handelse.createInstance<string>()

    preCreate.do(
      username =>
        !Boolean(Object.values(mockStore).find(u => u.username === username)),
    )

    doCreate.do(u => {
      return preCreate
        .go(u.username)
        .then(allPass)
        .then(checks => {
          if (checks) {
            const id = randomUUID()
            mockStore[id] = u
            return true
          }
          return false
        })
    })

    return doCreate
      .go(user)
      .then(result => allPass(result) && atLeastOne(result))
      .then(comp => res(comp))
  })

it('main', async () => {
  await main({username: 'foo'})
  const foo = Object.values(mockStore).find(user => user.username === 'foo')
  expect(foo).toStrictEqual({username: 'foo'})
})
