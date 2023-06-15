import { isLogging } from '../helpers'
import { ChannelConfig, RequiredProperties } from '../types'

interface IFlowStat {
  name?: string
  active: boolean
  config?: string
}

interface IRouteStat {
  name?: string
  active?: boolean
  flows?: {
    [key: string]: IFlowStat
  }
}

export interface IState {
  [key: string]: {
    name?: string
    active?: boolean
    ingestFlows?: {
      [key: string]: IFlowStat
    }
    routes?: {
      [key: string]: IRouteStat
    }
  }
}

class State {
  private state: IState
  constructor(state: IState) {
    this.state = state
  }
  public get() {
    return this.state
  }
  public setChannel = (channelId: string, active: boolean) => {
    if (this.state?.[channelId] === undefined) {
      console.warn(`Channel "${channelId}" not found in state`)
      return this
    }
    this.state[channelId].active = active
    return this
  }
  private setState = (state: boolean) => {
    Object.keys(this.state).forEach((channelId) => {
      this.state[channelId].active = state
    })
    return this
  }
  public enableAll = () => this.setState(true)
  public disableAll = () => this.setState(false)
  public setFlow = (
    channelId: string,
    type: 'ingest' | 'route',
    flowIndex: number,
    routeIndex?: number
  ) => {
    console.log(
      `TODO: implement setFlow! Tried to call with: ${{
        channelId,
        type,
        flowIndex,
        routeIndex,
      }}`
    )
    return this
  }
  public addChannel = <
    Filt extends 'O' | 'F' | 'B' = 'B',
    Tran extends 'O' | 'F' | 'B' = 'B'
  >(
    channel: RequiredProperties<ChannelConfig<Filt, Tran, 'S'>, 'id'>
  ) => {
    const channelId = channel.id
    if (this.state?.[channelId] !== undefined) {
      if (isLogging('error', channel.logLevel))
        console.warn(
          `Channel "${channelId}" already exists in state. Not overwriting.`
        )
      return this
    }
    const ingestFlows: {
      [k: string]: IFlowStat
    } = Object.fromEntries(
      channel.ingestion.map((flow) => {
        const stat: IFlowStat = {
          active: true,
          name: flow.name,
          config:
            typeof flow.flow === 'function'
              ? flow.flow.toString()
              : JSON.stringify(flow.flow, (_, v) =>
                  typeof v === 'function' ? v.toString() : v
                ),
        }
        return [flow.id, stat]
      })
    )

    const routes: {
      [key: string]: IRouteStat
    } = Object.fromEntries(
      channel.routes?.map((route) => {
        const flows: {
          [k: string]: IFlowStat
        } = Object.fromEntries(
          route.flows.map((flow) => {
            const stat: IFlowStat = {
              active: true,
              name: flow.name,
              config:
                typeof flow.flow === 'function'
                  ? flow.flow.toString()
                  : JSON.stringify(flow.flow, (_, v) =>
                      typeof v === 'function' ? v.toString() : v
                    ),
            }
            return [flow.id, stat]
          })
        )
        return [
          route.id,
          {
            active: true,
            name: route.name,
            flows,
          },
        ]
      }) ?? []
    )

    this.state[channelId] = {
      active: true,
      name: channel.name,
      ingestFlows,
      routes,
    }
    return this
  }
  public removeChannel = (channelId: string) => {
    delete this.state[channelId]
    return this
  }
}

export default State
