import { IMsg } from '@gofer-engine/hl7';
import { IChannelEvents } from './events';
import { TLogLevel } from './types';
import { isLogging } from './helpers';

export const verboseListeners = (
  logLevel: TLogLevel | undefined,
  handlers: IChannelEvents<IMsg>,
) => {
  const logger = (channel: string | number | undefined, log: string) => {
    console.log(`${new Date().toISOString()}: <${channel}> ${log}`);
    return true;
  };
  if (isLogging('debug', logLevel)) {
    handlers.onAck.do(({ channel }) => logger(channel, `Acknowledged Msg`));
    handlers.onFilter.do(({ channel, flow, route }) =>
      logger(channel, `Filtered Msg — ${JSON.stringify({ flow, route })}`),
    );
    handlers.onReceive.do(({ channel }) => logger(channel, `Received Msg`));
    handlers.onIngest.do(({ channel, accepted }) =>
      logger(channel, `Ingested Msg — ${JSON.stringify({ accepted })}`),
    );
    handlers.onTransform.do(({ channel, flow, route }) =>
      logger(channel, `Transformed Msg — ${JSON.stringify({ flow, route })}`),
    );
    handlers.onQueue.do(({ channel, queue, id }) =>
      logger(channel, `Quued Msg — ${JSON.stringify({ queue, id })}`),
    );
    handlers.onQueueStart.do(({ channel, queue, id }) =>
      logger(channel, `Queue Start Msg — ${JSON.stringify({ queue, id })}`),
    );
    handlers.onQueueRetry.do(({ channel, queue, id }) =>
      logger(channel, `Queue Retry Msg — ${JSON.stringify({ queue, id })}`),
    );
    handlers.onQueueFail.do(({ channel, queue, id }) =>
      logger(channel, `Queue Fail Msg — ${JSON.stringify({ queue, id })}`),
    );
    handlers.onQueueRemove.do(({ channel, queue, id }) =>
      logger(channel, `Queue Remove Msg — ${JSON.stringify({ queue, id })}`),
    );
    handlers.onRouteStart.do(({ channel, route }) =>
      logger(channel, `Route Msg — ${JSON.stringify(route)}`),
    );
    handlers.onRouteEnd.do(({ channel, route, status }) =>
      logger(
        channel,
        `Route Compled for Msg — ${JSON.stringify({ route, status })}`,
      ),
    );
    handlers.onComplete.do(({ channel, status }) =>
      logger(channel, `Completed Routes — ${JSON.stringify({ status })}`),
    );
  }
  if (isLogging('info', logLevel)) {
    handlers.onLog.do(({ log, channel, flow, id, queue, route }) =>
      logger(
        channel,
        `${JSON.stringify(log)} ${JSON.stringify({
          channel,
          flow,
          id,
          queue,
          route,
        })}`,
      ),
    );
  }
  if (isLogging('warn', logLevel)) {
    // nothing here yet...
  }
  if (isLogging('error', logLevel)) {
    handlers.onError.do(({ channel, error, route, flow, queue, id }) =>
      logger(
        channel,
        `Error: "${JSON.stringify(error)}" — ${JSON.stringify({
          route,
          flow,
          queue,
          id,
        })}`,
      ),
    );
  }
};
