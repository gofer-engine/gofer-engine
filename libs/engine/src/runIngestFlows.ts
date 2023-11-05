import handelse from '@gofer-engine/handelse';
import { logger } from "@gofer-engine/logger";
import { StoreConfig } from '@gofer-engine/stores';

import { filterOrTransform } from './filterOrTransform';
import { store } from './initStores';
import { IngestFunc } from './types';
import { getMsgType } from ".";
import { doAck } from "@gofer-engine/ack";

export const runIngestFlows: IngestFunc = (channel, msg, ack, context) => {
  let filtered = false;
  channel.ingestion.forEach((flow) => {
    const step = flow.flow;
    if (typeof step === 'object') {
      if (step.kind === 'ack') {
        const ackConfig = step.ack;
        const ackMsg = doAck(
          msg,
          ackConfig,
          {
            filtered,
            channelId: channel.id,
            flowId: flow.id,
          },
          context,
          getMsgType,
        );
        if (typeof ack === 'function') {
          context.logger = logger({
            channelId: channel.id,
            flowId: flow.id,
            msg,
          });
          ack(ackMsg, context);
          handelse.go(`gofer:${channel.id}.onAck`, {
            msg,
            ack: ackMsg,
            channel: channel.id,
          });
        }
        return;
      } else if (step.kind === 'filter') {
        const [m, f] = filterOrTransform(
          msg,
          filtered,
          step.filter,
          channel.id,
          flow.id,
          undefined,
          context,
        );
        msg = m;
        filtered = f;
      } else if (step.kind === 'transformFilter') {
        const [m, f] = filterOrTransform(
          msg,
          filtered,
          step.transformFilter,
          channel.id,
          flow.id,
          undefined,
          context,
        );
        msg = m;
        filtered = f;
      } else if (step.kind === 'transform') {
        const [m, f] = filterOrTransform(
          msg,
          filtered,
          step.transform,
          channel.id,
          flow.id,
          undefined,
          context,
        );
        msg = m;
        filtered = f;
      } else if (step.kind === 'store') {
        const storeConfig = { ...step };
        store(storeConfig as StoreConfig, msg, context)
          ?.then((res) => {
            if (res)
              return handelse.go(`gofer:${channel.id}.onLog`, {
                msg,
                log: `Stored Msg`,
                channel: channel.id,
                flow: flow.id,
              });
            return handelse.go(`gofer:${channel.id}.onError`, {
              msg,
              error: `Failed to store Msg`,
              channel: channel.id,
              flow: flow.id,
            });
          })
          .catch((error: unknown) => {
            handelse.go(`gofer:${channel.id}.onError`, {
              msg,
              error,
              channel: channel.id,
              flow: flow.id,
            });
          }) || false;
      }
    } else if (typeof step === 'function') {
      const [m, f] = filterOrTransform(
        msg,
        filtered,
        step,
        channel.id,
        flow.id,
        undefined,
        context,
      );
      msg = m;
      filtered = f;
    }
  });
  if (!filtered) return msg;
  return false;
};
