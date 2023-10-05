import Msg from '@gofer-engine/hl7'
import fs from 'fs'
import stores from '..'
import { 
  DgraphClient,
  DgraphClientStub,
  Operation,
  Request,
  Response,
} from 'dgraph-js'
import { credentials } from '@grpc/grpc-js'
import exec from 'tools/scripts/exec'

let stub: DgraphClientStub | undefined = undefined
let dgraph: DgraphClient | undefined = undefined

const hl7 = fs.readFileSync('./samples/sample.hl7', 'utf8')

const msg = new Msg(hl7)

const main = async () => {
  if (!dgraph) {
    fail('Dgraph client was not initialized')
  }
  const op = new Operation()
  op.setDropAll(true)
  await dgraph.alter(op)
  const db = new stores.dgraph({ uri: '127.0.0.1:9080' })
  await db.updateSchema()
  await db.store(msg)
  const query = `{
    msgs(func: eq(id, "MSGID002")){
      # uid
      dgraph.type
      id
      meta {
        # uid
        dgraph.type
        version
        messageCode
        triggerEvent
        messageStructure
        id
        encodedAt
        encodingCharacters {
          dgraph.type
          # uid
          fieldSep
          componentSep
          subComponentSep
          repetitionSep
          escapeChar
          truncateChar
        }
      }
      segments(orderasc: Segment.position) {
        # uid
        dgraph.type
        Segment.position
        Segment.name
        Segment.value
        fields(orderasc: Field.position) {
          # uid
          dgraph.type
          Field.position
          Field.value
          repetitions(orderasc: FieldRep.position) {
            # uid
            dgraph.type
            FieldRep.position
            FieldRep.value
            components(orderasc: Component.position) {
              # uid
              dgraph.type
              Component.position
              Component.value
              subcomponents(orderasc: Subcomponent.position) {
                # uid
                dgraph.type
                Subcomponent.position
                value
              }
            }
          }
        }
      }
      Message.value
    }
  }`

  const request = new Request()
  request.setQuery(query)

  const txn = dgraph.newTxn({ bestEffort: false, readOnly: true })

  let response: Response | undefined

  try {
    response = await txn.doRequest(request)
  } catch (e) {
    console.error(e)
  } finally {
    await txn.discard()
  }
  const storedMsg = response?.getJson()?.msgs?.[0]
  await db.close()
  expect(storedMsg).toEqual(db.typeMessage(msg.json(true), 'MSGID002', hl7))
}

beforeAll(async () => {
  await exec('sh ./libs/stores/src/stores/dgraph.test.sh')
  await new Promise((resolve) => setTimeout(resolve, 10000))
  stub = new DgraphClientStub(
    '127.0.0.1:9080',
    credentials.createInsecure()
  )
  dgraph = new DgraphClient(stub)
}, 60000)

test('store', main, 15000)

afterAll(async () => {
  if (stub) stub.close()
  await exec('docker stop jest-dgraph')
}, 60000)