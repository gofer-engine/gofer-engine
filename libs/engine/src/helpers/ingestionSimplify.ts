import { ChannelConfig, Ingestion, IngestionFlow } from "../types";

// this function does not modify the original channel object and returns only the ingestion flows
export const ingestionSimplify = <
  Filt extends 'O' | 'F' | 'B' = 'B',
  Tran extends 'O' | 'F' | 'B' = 'B',
>(
  channel: ChannelConfig<Filt, Tran, 'S' | 'L'>,
): IngestionFlow[] => {
  return channel.ingestion.map((flow) => {
    if (
      typeof flow === 'object' &&
      Object.prototype.hasOwnProperty.call(flow, 'flow')
    ) {
      return (flow as Ingestion).flow as IngestionFlow;
    }
    return flow as IngestionFlow;
  });
};