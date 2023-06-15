import { apiServer } from './api'
import State from './state'
import gql from './api/gql'
import { gofer } from './gofer'

export * from './types'

export const state = new State({})

export const stopAPI = apiServer(async (req) => {
  const res = await new gql(JSON.parse(req.body), state).res()
  return {
    protocol: req.protocol,
    headers: new Map([['Content-Type', 'application/json']]),
    statusCode: 200,
    status: 'OK',
    body: JSON.stringify(res),
  }
})

export default gofer
