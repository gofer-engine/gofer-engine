import { IDemensionalObject, IMultiDemensionalObject, TVariableTypes } from "./types";

export class Variables {
  private vars: {
    global: IDemensionalObject;
    channel: IMultiDemensionalObject;
    route: IMultiDemensionalObject;
    message: IMultiDemensionalObject;
  } = {
    global: {},
    channel: {},
    route: {},
    message: {},
  };
  constructor() {
    //
  }
  public getVar = <D = unknown, T extends TVariableTypes = TVariableTypes>(
    varType: T,
    id: T extends 'global' ? undefined : string | number,
    varName: string,
  ): D | undefined => {
    if (varType === 'global') {
      return this.vars.global?.[varName] as D | undefined;
    } else if (id !== undefined) {
      const key = varType as Exclude<TVariableTypes, 'global'>;
      return this.vars[key]?.[id]?.[varName] as D | undefined;
    }
    return undefined;
  };
  public setVar = <D = unknown, T extends TVariableTypes = TVariableTypes>(
    varType: T,
    id: T extends 'global' ? undefined : string | number,
    varName: string,
    varValue: D,
  ): void => {
    if (varType === 'global') {
      this.vars.global[varName] = varValue;
    } else if (id !== undefined) {
      const t = varType as Exclude<TVariableTypes, 'global'>;
      const i = id as string | number;
      const v = this.vars[t][i] ?? {};
      v[varName] = varValue;
      this.vars[t][i] = v;
    }
  };
  public deleteVar = <T extends TVariableTypes = TVariableTypes>(
    varType: T,
    id: T extends 'global' ? undefined : string | number,
    varName: string,
  ): void => {
    if (varType === 'global') {
      delete this.vars.global[varName];
    } else if (id !== undefined) {
      const t = varType as Exclude<TVariableTypes, 'global'>;
      const i = id as string | number;
      const v = this.vars[t][i] ?? {};
      delete v[varName];
      this.vars[t][i] = v;
    }
  };
  public deleteVarBlock = (
    varType: Exclude<TVariableTypes, 'global'>,
    id: string | number,
  ) => {
    delete this.vars[varType][id];
  };
}
