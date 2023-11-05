import handelse from '@gofer-engine/handelse';
import { TLogLevel } from "@gofer-engine/message-type";

type TLoggerArgs<T> = {
  channelId: string | number;
  routeId?: string | number;
  flowId?: string | number;
  readonly msg?: T;
};

export const logger =
  <T>({ channelId, flowId, msg }: TLoggerArgs<T>) =>
  (log: string, logLevel?: TLogLevel) =>
    handelse.go(`gofer:${channelId}.onLog`, {
      msg,
      log,
      channel: channelId,
      flow: flowId,
      level: logLevel,
    });
