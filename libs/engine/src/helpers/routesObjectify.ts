import { genId } from "@gofer-engine/tools";
import { isLogging, routeFlowObjectify } from "..";
import { ChannelConfig, RouteFlow, RouteFlowNamed } from "../types";
import { publishers } from "@gofer-engine/events";

// this function modifies the original channel object to prevent generating new ids on every call
export const routesObjectify = (
  channel: ChannelConfig,
): ChannelConfig<'B', 'B', 'S'> => {
  channel.routes = channel.routes?.map((route) => {
    if (
      typeof route === 'object' &&
      !Array.isArray(route) &&
      route.kind === 'route'
    ) {
      if (route?.id === undefined) {
        const routeId = genId();
        if (isLogging('warn', channel.logLevel))
          publishers.onLog(
            `Channel ${channel.name} (${channel.id}) had an route without an id. Generated id: ${routeId}`,
          );
        route.id = routeId;
      }
      route.flows = routeFlowObjectify(route.flows, channel.logLevel);
      return route;
    }
    const routeId = genId();
    if (isLogging('warn', channel.logLevel))
      publishers.onLog(
        `Channel ${channel.name} (${channel.id}) had an route without an id. Generated id: ${routeId}`,
      );
    return {
      kind: 'route',
      id: routeId,
      flows: routeFlowObjectify(
        route as (RouteFlow | RouteFlowNamed)[],
        channel.logLevel,
      ),
    };
  });
  return channel as unknown as ChannelConfig<'B', 'B', 'S'>;
};
