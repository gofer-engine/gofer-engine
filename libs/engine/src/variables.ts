type IDemensionalObject<T = unknown> = { [key in string]?: T }
type IMultiDemensionalObject<T = unknown> = {
  [key in string | number]?: IDemensionalObject<T>
}

type TVariableTypes = 'global' | 'channel' | 'route' | 'message'

class Variables {
  private vars: {
    global: IDemensionalObject
    channel: IMultiDemensionalObject
    route: IMultiDemensionalObject
    message: IMultiDemensionalObject
  } = {
    global: {},
    channel: {},
    route: {},
    message: {},
  }
  constructor() {
    //
  }
  public getVar = <D = unknown, T extends TVariableTypes = TVariableTypes>(
    varType: T,
    id: T extends 'global' ? undefined : string | number,
    varName: string
  ): D | undefined => {
    if (varType === 'global') {
      return this.vars.global?.[varName] as D | undefined
    } else if (id !== undefined) {
      const key = varType as Exclude<TVariableTypes, 'global'>
      return this.vars[key]?.[id]?.[varName] as D | undefined
    }
    return undefined
  }
  public setVar = <D = unknown, T extends TVariableTypes = TVariableTypes>(
    varType: T,
    id: T extends 'global' ? undefined : string | number,
    varName: string,
    varValue: D
  ): void => {
    if (varType === 'global') {
      this.vars.global[varName] = varValue
    } else if (id !== undefined) {
      const t = varType as Exclude<TVariableTypes, 'global'>
      const i = id as string | number
      const v = this.vars[t][i] ?? {}
      v[varName] = varValue
      this.vars[t][i] = v
    }
  }
  public deleteVar = <T extends TVariableTypes = TVariableTypes>(
    varType: T,
    id: T extends 'global' ? undefined : string | number,
    varName: string
  ): void => {
    if (varType === 'global') {
      delete this.vars.global[varName]
    } else if (id !== undefined) {
      const t = varType as Exclude<TVariableTypes, 'global'>
      const i = id as string | number
      const v = this.vars[t][i] ?? {}
      delete v[varName]
      this.vars[t][i] = v
    }
  }
  public deleteVarBlock = (
    varType: Exclude<TVariableTypes, 'global'>,
    id: string | number
  ) => {
    delete this.vars[varType][id]
  }
}

const v = new Variables()

/* eslint-disable @typescript-eslint/no-explicit-any */
export const setGlobalVar = <V = any>(varName: string, varValue: V) =>
  v.setVar('global', undefined, varName, varValue)

export const getGlobalVar = <V = any>(varName: string) =>
  v.getVar<V>('global', undefined, varName)

export const setChannelVar =
  (channelID: string | number) =>
  <V = any>(varName: string, varValue: V) =>
    v.setVar('channel', channelID, varName, varValue)

export const getChannelVar =
  (channelID: string | number) =>
  <V = any>(varName: string) =>
    v.getVar<V>('channel', channelID, varName)

export const setRouteVar =
  (routeID: string | number) =>
  <V = any>(varName: string, varValue: V) =>
    v.setVar('route', routeID, varName, varValue)

export const getRouteVar =
  (routeID: string | number) =>
  <V = any>(varName: string) =>
    v.getVar<V>('route', routeID, varName)

export const setMsgVar =
  (messageID: string | number) =>
  <V = any>(varName: string, varValue: V) =>
    v.setVar('message', messageID, varName, varValue)

export const getMsgVar =
  (messageID: string | number) =>
  <V = any>(varName: string) =>
    v.getVar<V>('message', messageID, varName)
/* eslint-enable @typescript-eslint/no-explicit-any */

export const clearMsgVars = (messageID: string) => {
  v.deleteVarBlock('message', messageID)
}
