export type IDemensionalObject<T = unknown> = { [key in string]?: T };
export type IMultiDemensionalObject<T = unknown> = {
  [key in string | number]?: IDemensionalObject<T>;
};

export type TVariableTypes = 'global' | 'channel' | 'route' | 'message';