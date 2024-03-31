import { Server } from 'net';
import { Job } from 'node-schedule';

import { HTTPConfig } from '@gofer-engine/http';
import { HTTPSConfig } from '@gofer-engine/https';
import { ScheduleDef } from '@gofer-engine/scheduler';

import { coerceStrictTypedChannels } from './helpers';
import { initServers, jobs, servers } from './initServers';
import { initStores } from './initStores';
import { IngestionClass } from './IngestionClass';
import { messenger } from './messenger';
import { state } from './state';
import {
  ChannelConfig,
  Connection,
  MessageRunner,
  OGofer,
  OIngest,
} from './types';
import { MsgTypes } from '@gofer-engine/message-type';

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
  public schedule = (
    msgType?: MsgTypes,
    schedule?: ScheduleDef,
    runOnceOnStart?: boolean,
  ): MessageRunner => {
    return {
      run(runner) {
        return new IngestionClass({
          kind: 'schedule',
          schedule: {
            msgType,
            schedule,
            runOnStart: runOnceOnStart,
            runner,
          },
        });
      },
      sftp(config) {
        return new IngestionClass({
          kind: 'schedule',
          schedule: {
            msgType,
            schedule,
            runOnStart: runOnceOnStart,
            runner: {
              kind: 'sftp',
              sftp: config,
            },
          },
        });
      },
      file(config) {
        return new IngestionClass({
          kind: 'schedule',
          schedule: {
            msgType,
            schedule,
            runOnStart: runOnceOnStart,
            runner: {
              kind: 'file',
              file: config,
            },
          },
        });
      },
    };
  };
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
  public messenger = messenger;
  public getJob = (channelId: string): Job | undefined => {
    return jobs?.[channelId];
  };
  public getServer = (serverId: string): Server => {
    return servers?.[serverId];
  };
}

export const gofer = new Gofer();
