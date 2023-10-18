import { state } from './state';
import { coerceStrictTypedChannels } from './helpers';
import { initServers } from './initServers';
import { initStores } from './initStores';
import {
  ChannelConfig,
  Connection,
  HTTPConfig,
  HTTPSConfig,
  OGofer,
  OIngest,
} from './types';
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
  public listen(type: 'https', options: HTTPSConfig<'I'>): OIngest;
  public listen(type: 'http', options: HTTPConfig<'I'>): OIngest;
  public listen(type: 'tcp', host: string, port: number): OIngest;
  public listen(
    type: 'https' | 'http' | 'tcp',
    hostOrOptions: string | HTTPConfig<'I'> | HTTPSConfig<'I'>,
    port?: number,
  ): OIngest {
    if (type === 'tcp') {
      const source: Connection<'I'> = {
        kind: type,
        [type]: {
          host: hostOrOptions as string,
          port: port as number,
        },
      };
      return new IngestionClass(source);
    }
    if (type === 'http') {
      const source: Connection<'I'> = {
        kind: type,
        [type]: hostOrOptions as HTTPConfig<'I'>,
      };
      return new IngestionClass(source);
    }
    if (type === 'https') {
      const source: Connection<'I'> = {
        kind: type,
        [type]: hostOrOptions as HTTPSConfig<'I'>,
      };
      return new IngestionClass(source);
    }
    // this error should be unreachable.
    throw new Error(`Unsupported connection type ${type}`);
  }
  // public files: OGofer['files'] = (config) => {
  //   return undefined as any
  // }
  // public msg: OGofer['msg'] = (msg) => {
  //    RouteClass()
  // }
  public messenger: OGofer['messenger'] = messenger;
}

export const gofer = new Gofer();
