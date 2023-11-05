import {
  FilterFunc,
  MsgVar,
  ORoute,
  Route,
  WithVarDo,
  varTypes,
} from './types';
import { StoreConfig } from '@gofer-engine/stores';
import { FunctProp, IMessageContext, IMsg } from '@gofer-engine/message-type';
import { genId } from '@gofer-engine/tools';
import { isMsgVFunc } from './isMsgVFunc';
import { SetRequired } from 'type-fest';
import { HTTPSConfig } from "@gofer-engine/https";
import { HTTPConfig } from "@gofer-engine/http";

export class RouteClass implements ORoute {
  private config: SetRequired<Route<'F', 'F', 'S'>, 'id' | 'flows'>;
  constructor() {
    const id = genId();
    this.config = {
      id,
      kind: 'route',
      flows: [],
    };
  }
  public id: (id: string | number) => ORoute = (id) => {
    this.config.id = id;
    return this;
  };
  public name: (name: string) => ORoute = (name) => {
    this.config.name = name;
    return this;
  };
  public filter: (f: FilterFunc) => ORoute = (filter) => {
    const id = genId();
    this.config.flows.push({
      id,
      kind: 'flow',
      flow: filter,
    });
    return this;
  };
  public transform: (
    t: (msg: IMsg, context: IMessageContext) => IMsg,
  ) => ORoute = (transform) => {
    const id = genId();
    this.config.flows.push({
      id,
      kind: 'flow',
      flow: transform,
    });
    return this;
  };
  public store: (s: StoreConfig) => ORoute = (store) => {
    const id = genId();
    this.config.flows.push({
      id,
      kind: 'flow',
      flow: {
        kind: 'store',
        ...store,
      },
    });
    return this;
  };
  public setVar = <V>(
    scope: varTypes,
    varName: string,
    varValue: MsgVar<V>,
  ): ORoute => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        const val = isMsgVFunc(varValue) ? varValue(msg, context) : varValue;
        switch (scope) {
          case 'Msg':
            context.setMsgVar(context.messageId, varName, val);
            break;
          case 'Channel':
            context.setChannelVar(varName, val);
            break;
          case 'Global':
            context.setGlobalVar(varName, val);
            break;
          default:
            throw new Error(`Invalid scope: ${scope}`);
        }
        return true;
      },
    });
    return this;
  };
  public setMsgVar = <V>(varName: string, varValue: MsgVar<V>): ORoute => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        const val = isMsgVFunc(varValue) ? varValue(msg, context) : varValue;
        context.setMsgVar(context.messageId, varName, val);
        return true;
      },
    });
    return this;
  };
  public setRouteVar: <V>(varName: string, varValue: MsgVar<V>) => ORoute = (
    varName,
    varValue,
  ) => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        const val = isMsgVFunc(varValue) ? varValue(msg, context) : varValue;
        context.setRouteVar?.(varName, val);
        return true;
      },
    });
    return this;
  };
  public setChannelVar: <V>(varName: string, varValue: MsgVar<V>) => ORoute = (
    varName,
    varValue,
  ) => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        const val = isMsgVFunc(varValue) ? varValue(msg, context) : varValue;
        context.setChannelVar(varName, val);
        return true;
      },
    });
    return this;
  };
  public setGlobalVar: <V>(varName: string, varValue: MsgVar<V>) => ORoute = (
    varName,
    varValue,
  ) => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        const val = isMsgVFunc(varValue) ? varValue(msg, context) : varValue;
        context.setGlobalVar(varName, val);
        return true;
      },
    });
    return this;
  };
  public getVar = <V>(
    scope: varTypes,
    varName: string,
    getVal: WithVarDo<V>,
  ): ORoute => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        let val: V | undefined = undefined;
        switch (scope) {
          case 'Msg':
            val = context.getMsgVar<V>(context.messageId, varName);
            break;
          case 'Channel':
            val = context.getChannelVar<V>(varName);
            break;
          case 'Route':
            val = context.getRouteVar?.<V>(varName);
            break;
          case 'Global':
            val = context.getGlobalVar<V>(varName);
            break;
          default:
            throw new Error(`Invalid scope: ${scope}`);
        }
        const res = getVal(val, msg, context);
        if (res === undefined) return msg;
        if (!res) return false;
        return msg;
      },
    });
    return this;
  };
  public getMsgVar = <V>(varName: string, getVal: WithVarDo<V>): ORoute => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        const val = context.getMsgVar<V>(context.messageId, varName);
        const res = getVal(val, msg, context);
        if (res === undefined) return msg;
        if (!res) return false;
        return msg;
      },
    });
    return this;
  };
  public getRouteVar = <V>(varName: string, getVal: WithVarDo<V>): ORoute => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        const val = context.getRouteVar?.<V>(varName);
        const res = getVal(val, msg, context);
        if (res === undefined) return msg;
        if (!res) return false;
        return msg;
      },
    });
    return this;
  };
  public getChannelVar = <V>(varName: string, getVal: WithVarDo<V>): ORoute => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        const val = context.getChannelVar<V>(varName);
        const res = getVal(val, msg, context);
        if (res === undefined) return msg;
        if (!res) return false;
        return msg;
      },
    });
    return this;
  };
  public getGlobalVar = <V>(varName: string, getVal: WithVarDo<V>): ORoute => {
    this.config.flows.push({
      id: genId(),
      kind: 'flow',
      flow: (msg, context) => {
        const val = context.getGlobalVar<V>(varName);
        const res = getVal(val, msg, context);
        if (res === undefined) return msg;
        if (!res) return false;
        return msg;
      },
    });
    return this;
  };
  public send(method: 'https', options: HTTPSConfig<'O'>): ORoute;
  public send(method: 'http', options: HTTPConfig<'O'>): ORoute;
  public send(
    method: 'tcp',
    host: FunctProp<string>,
    port: FunctProp<number>,
  ): ORoute;
  public send(
    type: 'http' | 'tcp' | 'https',
    hostOrOptions: FunctProp<string> | HTTPConfig<'O'> | HTTPSConfig<'O'>,
    port?: FunctProp<number>,
  ): ORoute {
    if (type === 'tcp') {
      this.config.flows.push({
        id: genId(),
        kind: 'flow',
        flow: {
          kind: 'tcp',
          [type]: {
            host: hostOrOptions as FunctProp<string>,
            port: port as FunctProp<number>,
          },
        },
      });
      return this;
    }
    if (type === 'http') {
      this.config.flows.push({
        id: genId(),
        kind: 'flow',
        flow: {
          kind: 'http',
          [type]: hostOrOptions as HTTPConfig<'O'>,
        },
      });
      return this;
    }
    if (type === 'https') {
      this.config.flows.push({
        id: genId(),
        kind: 'flow',
        flow: {
          kind: 'https',
          [type]: hostOrOptions as HTTPSConfig<'O'>,
        },
      });
      return this;
    }
    throw new Error(`Unsupported connection type ${type}`);
  }
  public export = () => this.config;
}
