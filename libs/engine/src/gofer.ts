import { state } from './state';
import { coerceStrictTypedChannels } from './helpers';
import { initServers } from './initServers';
import { initStores } from './initStores';
import { ChannelConfig, Connection, OGofer } from './types';
import { IngestionClass } from './IngestionClass';
import { messenger } from './messenger';

class Gofer implements OGofer {
  private init = (channels?: ChannelConfig[]) => {
    if (channels && channels.length) {
      initServers(
        initStores(
          coerceStrictTypedChannels(channels).map((channel) => {
            state.addChannel(channel);
            return channel;
          }),
        ),
      );
    }
  };
  public configs: OGofer['configs'] = (channels) => this.init(channels);
  public run: OGofer['run'] = (channel) => {
    this.configs([channel]);
    return channel.id;
  };
  constructor(channels?: ChannelConfig[]) {
    this.init(channels);
  }
  public listen: OGofer['listen'] = (type, host, port) => {
    const source: Connection<'I'> = {
      kind: type,
      [type]: {
        host,
        port,
      },
    };
    return new IngestionClass(source);
  };
  // public files: OGofer['files'] = (config) => {
  //   return undefined as any
  // }
  // public msg: OGofer['msg'] = (msg) => {
  //    RouteClass()
  // }
  public messenger: OGofer['messenger'] = messenger;
}

export const gofer = new Gofer();
