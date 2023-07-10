import { IMsg } from "@gofer-engine/ts-hl7"
import gofer from "."
import { ChannelConfig, IMessageContext, OComplete } from "./types"
import { genId } from "./genId"

export class CompleteClass implements OComplete {
  private config: ChannelConfig<'B', 'B', 'S'>
  constructor(config: ChannelConfig<'B', 'B', 'S'>) {
    this.config = config
  }
  public export: OComplete['export'] = () => {
    return this.config
  }
  // public msg = (): Msg => {}
  public run = (): void => {
    gofer.run(this.config)
  }
  // NOTE: if this is used with multiple routes, it will be called once at the end of each route
  public msg = (cb: (msg: IMsg, context: IMessageContext) => void): void => {
    this.config.routes?.forEach((route) => {
      route.flows.push({
        id: genId(),
        kind: 'flow',
        flow: (msg, context) => {
          cb(msg, context)
          return true
        }
      })
    })
  }
}