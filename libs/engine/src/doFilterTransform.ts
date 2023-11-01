import handelse from '@gofer-engine/handelse';
import { IMsg } from '@gofer-engine/message-type';
import { IMessageContext } from './types';
import { logger } from './helpers';

export type DoFilterTransformRes = {
  filtered: boolean;
  flows: (boolean | Promise<boolean>)[];
  msg: IMsg
}

export const doFilterTransform = (
  msg: IMsg,
  flow: (msg: IMsg, context: IMessageContext) => boolean | IMsg,
  flowId: string | number,
  context: IMessageContext,
  flows: (boolean | Promise<boolean>)[],
  filtered: boolean,
  direct?: boolean,
): DoFilterTransformRes => {
  const { channelId, routeId } = context;
  context.logger = logger({
    channelId,
    routeId,
    flowId,
    msg,
  });
  const filterOrTransform = flow(msg, context);
  if (typeof filterOrTransform === 'boolean') {
    if (!filterOrTransform) {
      handelse.go(
        `gofer:${channelId}.onFilter`,
        {
          msg,
          channel: channelId,
          route: routeId,
          flow: flowId,
        },
        {
          createIfNotExists: direct,
        },
      );
    }
    filtered = !filterOrTransform;
    flows.push(true);
  } else {
    handelse.go(
      `gofer:${channelId}.onTransform`,
      {
        pre: msg,
        post: filterOrTransform,
        channel: channelId,
        route: routeId,
        flow: flowId,
      },
      {
        createIfNotExists: direct,
      },
    );
    msg = filterOrTransform;
  }
  return { filtered, flows, msg };
};
