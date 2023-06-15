import { state } from '.'
import { coerceStrictTypedChannels } from './helpers'
import { initServers } from './initServers'
import { initStores } from './initStores'
import { ChannelConfig, Connection, OGofer } from './types'
import { IngestionClass } from './IngestionClass'

class Gofer implements OGofer {
  private init = (channels?: ChannelConfig[]) => {
    if (channels && channels.length) {
      initServers(
        initStores(
          coerceStrictTypedChannels(channels).map((channel) => {
            state.addChannel(channel)
            return channel
          })
        )
      )
    }
  }
  public configs: OGofer['configs'] = (channels) => this.init(channels)
  public run: OGofer['run'] = (channel) => {
    this.configs([channel])
  }
  constructor(channels?: ChannelConfig[]) {
    this.init(channels)
  }
  public listen: OGofer['listen'] = (type, host, port) => {
    const source: Connection<'I'> = {
      kind: type,
      [type]: {
        host,
        port,          
      }
    }
    return new IngestionClass(source)
  }
  // public files: OGofer['files'] = (config) => {
  //   return undefined as any
  // }
  // public msg: OGofer['msg'] = (msg) => {
  //   return undefined as any
  // }
}

export const gofer = new Gofer()
