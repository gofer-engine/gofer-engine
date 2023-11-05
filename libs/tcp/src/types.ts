import { AllowFuncProp, MsgTypes } from "@gofer-engine/message-type";
import { QueueConfig } from "@gofer-engine/queue";

export type TcpConfig<T extends 'I' | 'O' = 'I'> = T extends 'I'
  ? ITcpConfig
  : ITcpConfig<true> & {
      responseTimeout?: number | false;
    };

export interface ITcpConfig<Functional extends boolean = false> {
  msgType?: MsgTypes; // defaults to HL7v2
  host: AllowFuncProp<Functional, string>;
  port: AllowFuncProp<Functional, number>;
  SoM?: AllowFuncProp<Functional, string>; // Start of Message: defaults to `Sting.fromCharCode(0x0b)`
  EoM?: AllowFuncProp<Functional, string>; // End of Message: defaults to `String.fromCharCode(0x1c)`
  CR?: AllowFuncProp<Functional, string>; // Carriage Return: defaults to `String.fromCharCode(0x0d)`
  maxConnections?: number; // used only for server TCP connections
}

export type TCPConnection<T extends 'I' | 'O'> = T extends 'I'
  ? { queue?: QueueConfig; kind: 'tcp'; tcp: TcpConfig<T> }
  : { kind: 'tcp'; tcp: TcpConfig<T> };
