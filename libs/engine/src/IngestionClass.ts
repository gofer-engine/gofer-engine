import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';

import { IMessageContext, IMsg } from '@gofer-engine/message-type';
import { genId } from '@gofer-engine/tools';

import { isMsgVFunc } from './isMsgVFunc';
import {
  ChannelConfig,
  Connection,
  OIngest,
  WithVarDo,
  varTypes,
} from './types';
import { CompleteClass } from './CompleteClass';
import { RouteClass } from './RouteClass';
import { gofer } from './gofer';

export class IngestionClass implements OIngest {
  private config: ChannelConfig<'B', 'B', 'S'>;
  constructor(source: Connection<'I'>) {
    const id = genId();
    this.config = {
      id,
      source: source,
      ingestion: [],
      name: uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        seed: id,
      }),
    };
  }
  public logLevel: OIngest['logLevel'] = (level) => {
    this.config.logLevel = level;
    return this;
  };
  public name: OIngest['name'] = (name) => {
    this.config.name = name;
    return this;
  };
  public id: OIngest['id'] = (id) => {
    this.config.id = id;
    return this;
  };
  public filter: OIngest['filter'] = (filter) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: filter,
    });
    return this;
  };
  public transform: OIngest['transform'] = (transform) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: transform,
    });
    return this;
  };
  public store: OIngest['store'] = (store) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'store',
        ...store,
      },
    });
    return this;
  };
  public setVar: OIngest['setVar'] = (scope, varName, varValue) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'filter',
        filter: (msg, context) => {
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
      },
    });
    return this;
  };
  public setMsgVar: OIngest['setMsgVar'] = (varName, varValue) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'filter',
        filter: (msg, context) => {
          const val = isMsgVFunc(varValue) ? varValue(msg, context) : varValue;
          context.setMsgVar(context.messageId, varName, val);
          return true;
        },
      },
    });
    return this;
  };
  public setChannelVar: OIngest['setChannelVar'] = (varName, varValue) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'filter',
        filter: (msg, context) => {
          const val = isMsgVFunc(varValue) ? varValue(msg, context) : varValue;
          context.setChannelVar(varName, val);
          return true;
        },
      },
    });
    return this;
  };
  public setGlobalVar: OIngest['setGlobalVar'] = (varName, varValue) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'filter',
        filter: (msg, context) => {
          const val = isMsgVFunc(varValue) ? varValue(msg, context) : varValue;
          context.setGlobalVar(varName, val);
          return true;
        },
      },
    });
    return this;
  };
  public getVar = <V>(
    scope: Exclude<varTypes, 'Route'>,
    varName: string,
    getVal: WithVarDo<V>,
  ) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'transformFilter',
        transformFilter: (msg, context) => {
          let val: V | undefined = undefined as V;
          switch (scope) {
            case 'Msg':
              val = context.getMsgVar<V>(context.messageId, varName);
              break;
            case 'Channel':
              val = context.getChannelVar<V>(varName);
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
      },
    });
    return this;
  };
  public getMsgVar = <V>(varName: string, getVal: WithVarDo<V>) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'transformFilter',
        transformFilter: (msg, context) => {
          const val = context.getMsgVar<V>(context.messageId, varName);
          const res = getVal(val, msg, context);
          if (res === undefined) return msg;
          if (!res) return false;
          return msg;
        },
      },
    });
    return this;
  };
  public getChannelVar = <V>(varName: string, getVal: WithVarDo<V>) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'transformFilter',
        transformFilter: (msg, context) => {
          const val = context.getChannelVar<V>(varName);
          const res = getVal(val, msg, context);
          if (res === undefined) return msg;
          if (!res) return false;
          return msg;
        },
      },
    });
    return this;
  };
  public getGlobalVar = <V>(varName: string, getVal: WithVarDo<V>) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'transformFilter',
        transformFilter: (msg, context) => {
          const val = context.getGlobalVar<V>(varName);
          const res = getVal(val, msg, context);
          if (res === undefined) return msg;
          if (!res) return false;
          return msg;
        },
      },
    });
    return this;
  };
  public ack: OIngest['ack'] = (ack) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'ack',
        ack: ack || {},
      },
    });
    return this;
  };
  public route: OIngest['route'] = (route) => {
    this.config.routes = [route(new RouteClass()).export()];
    return new CompleteClass(this.config);
  };
  public routes: OIngest['routes'] = (routes) => {
    this.config.routes = routes(() => new RouteClass()).map((route) =>
      route.export(),
    );
    return new CompleteClass(this.config);
  };
  public export: OIngest['export'] = () => this.config;
  public run = () => {
    return gofer.run(this.config);
  };
  public msg = (cb: (msg: IMsg, context: IMessageContext) => void) => {
    this.config.ingestion.push({
      id: genId(),
      kind: 'flow',
      flow: {
        kind: 'filter',
        filter: (msg, context) => {
          cb(msg, context);
          return true;
        },
      },
    });
  };
}
