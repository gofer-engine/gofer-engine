import { buildSchema } from 'graphql'

export const schema = buildSchema(`
  type Query {
    getConfig: GoferConfig
  }
  type GoferConfig {
    channels: [Channel!]
  }
  type Channel {
    id: ID!
    name: String
    active: Boolean
    ingestionFlows: [FlowStat!]
    routes: [RouteStat!]
  }
  type FlowStat {
    id: ID!
    name: String
    active: Boolean
    config: String
  }
  type RouteStat {
    id: ID!
    name: String
    active: Boolean
    flows: [FlowStat!]
  }
`)