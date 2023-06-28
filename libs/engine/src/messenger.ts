import Msg from "@gofer-engine/ts-hl7";
import { MessengerFunc, MessengerRoute, RequiredProperties, Route, RouteFlowNamed } from "./types";
import { RouteClass } from "./RouteClass";
import { runRoute } from "./runRoutes";
import { logger } from "./helpers";
import { getChannelVar, getGlobalVar, setChannelVar, setGlobalVar } from "./variables";

const messengers = new Map<string, MessengerFunc>()

export const messenger = (route: MessengerRoute): [messenger: MessengerFunc, id: string] => {
  const config = route(new RouteClass()).export()
  const flows = config.flows
  const id = typeof config.id === 'number' ? config.id.toString() : config.id
  const func = messengers.get(id) ?? ((msg) => {
    const message = (typeof msg === 'function') ? msg(new Msg()) : (msg instanceof Msg) ? msg : new Msg(msg)
    const msgId = message
    return new Promise<Msg>((res, rej) => {
      runRoute(
        id,
        id,
        flows,
        message,
        {
          channelId: id,
          routeId: id,
          logger: logger({ channelId: id }),
          setGlobalVar,
          getGlobalVar: getGlobalVar,
          setChannelVar: setChannelVar(id),
          getChannelVar: getChannelVar(id),
          setMsgVar: setMsgVar()
        }
      )
    })
  })
  if (!messengers.has(id)) {
    messengers.set(id, func)
  }
  return [func, id]
}