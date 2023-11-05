import { genId } from "@gofer-engine/tools";
import { isLogging } from "./isLogging";
import { ChannelConfig, Ingestion, IngestionFlow } from "../types";
import { publishers } from "@gofer-engine/events";

// this function modifies the original channel object to prevent generating new ids on every call
export const ingestionObjectify = (channel: ChannelConfig) => {
  channel.ingestion = channel.ingestion.map((flow) => {
    if (typeof flow === 'object' && flow.kind === 'flow') {
      if (flow?.id === undefined) {
        const ingestionId = genId();
        if (isLogging('warn', channel.logLevel))
          publishers.onLog(
            `Channel ${channel.name} (${channel.id}) had an ingestion flow without an id. Generated id: ${ingestionId}`,
          );
        flow.id = ingestionId;
      }
      return flow;
    }
    const ingestionId = genId();
    if (isLogging('warn', channel.logLevel))
      publishers.onLog(
        `Channel ${channel.name} (${channel.id}) had an ingestion flow without an id. Generated id: ${ingestionId}`,
      );
    return {
      id: ingestionId,
      flow: flow as IngestionFlow,
    } as Ingestion;
  });
  return channel;
};
