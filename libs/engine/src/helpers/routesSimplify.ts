import { ChannelConfig, Route, RouteFlow, RouteFlowNamed } from "../types";

// this function does not modify the original channel object and returns only the routes
export const routesSimplify = (channel: ChannelConfig): RouteFlow[][] => {
  return (
    channel.routes?.map((route) => {
      if (
        typeof route === 'object' &&
        Object.prototype.hasOwnProperty.call(route, 'flows')
      ) {
        route = (route as Route).flows;
      }
      return (route as (RouteFlow | RouteFlowNamed)[]).map((flow) => {
        if (
          typeof flow === 'object' &&
          Object.prototype.hasOwnProperty.call(flow, 'flow')
        ) {
          return (flow as RouteFlowNamed).flow;
        }
        return flow as RouteFlow;
      });
    }) ?? []
  );
};
