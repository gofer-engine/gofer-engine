import Msg, { MessageMeta, Segments } from '@gofer-engine/hl7'
import fs from 'fs'
import stores from '..'
import Surreal from 'surrealdb.js'
import exec from 'tools/scripts/exec'

let sdb: Surreal = new Surreal()

const hl7 = fs.readFileSync('./samples/sample.hl7', 'utf8')

const msg = new Msg(hl7)

beforeAll(async () => {
  await exec('sh ./libs/stores/src/stores/surreal.test.sh')
  sdb = new Surreal('http://127.0.0.1:8000/rpc')
}, 15000)

afterAll(async () => {
  await sdb.close()
  await exec('docker stop jest-surrealdb')
}, 60000)

test('store', async () => {
  expect(sdb.status).toBe(1)
  await sdb.signin({ user: 'root', pass: 'root' })
  await sdb.use({
    db: 'test',
    ns: 'test',
  })
  const existing = await sdb.query<({ id: string }[])[]>(
    'SELECT id FROM test:MSGID002;'
  )
  const id = existing?.[0]?.result?.[0]?.id
  if (id) {
    sdb.delete(id)
  }
  const db = new stores.surreal()
  return db.store(msg).then(async () => {
    const storedRecord = await sdb.query<({ meta: MessageMeta, segs: Segments }[])[]>('SELECT meta, msg as segs FROM test')
    const { meta, segs } = storedRecord?.[0].result?.[0] ?? {}
    const msg = new Msg([meta as MessageMeta, segs as Segments])
    await db.close()
    expect(msg.toString()).toBe(hl7)
  })
})
