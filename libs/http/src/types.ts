import { AllowFuncProp, MsgTypes } from "@gofer-engine/message-type";

export interface IHTTPConfig<Functional extends boolean = false> {
  msgType?: MsgTypes; // defaults to HL7v2
  host: AllowFuncProp<Functional, string>;
  port: AllowFuncProp<Functional, number>;
  method?:
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH';
  path?: string;
  basicAuth?: {
    username: AllowFuncProp<Functional, string>;
    password: AllowFuncProp<Functional, string>;
  };
}

export type HTTPConfig<T extends 'I' | 'O' = 'I'> = T extends 'I'
  ? IHTTPConfig
  : IHTTPConfig<true> & {
      responseTimeout?: number | false;
    };
