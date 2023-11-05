import { publishers } from "@gofer-engine/events";
import { TLogLevel } from "@gofer-engine/message-type";
import { genId } from "@gofer-engine/tools";

import { RouteFlow, RouteFlowNamed } from "../types";
import { isLogging } from "..";

export const routeFlowObjectify = (
  flows: (RouteFlow<'B', 'B'> | RouteFlowNamed<'B', 'B'>)[],
  logLevel?: TLogLevel,
): RouteFlowNamed<'B', 'B'>[] => {
  return flows.map((flow) => {
    if (typeof flow === 'object' && flow.kind === 'flow') {
      flow = flow as RouteFlowNamed<'B', 'B'>;
      if (flow?.id === undefined) {
        const flowId = genId();
        if (isLogging('warn', logLevel))
          publishers.onLog(
            `Named Route (${flow.name}) was missing the id. Generated id: ${flowId}`,
          );
        flow.id = flowId;
      }
      return flow;
    }
    const flowId = genId();
    if (isLogging('warn', logLevel))
      publishers.onLog(`Route was missing the id. Generated id: ${flowId}`);
    return {
      kind: 'flow',
      id: flowId,
      flow: flow as RouteFlow<'B', 'B'>,
    };
  });
};
