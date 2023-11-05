import HL7v2Msg from "@gofer-engine/hl7";
import { JSONMsg } from "@gofer-engine/json";
import { GetMsgType, IMsg, MsgTypes } from "@gofer-engine/message-type";

type MsgProps<T extends MsgTypes> = T extends 'HL7v2' 
  ?  ConstructorParameters<typeof HL7v2Msg>
  : T extends 'JSON'
    ? ConstructorParameters<typeof JSONMsg>
    : never;

export const getMsgType: GetMsgType = <T extends MsgTypes>(
  msg: T, ...props: MsgProps<T>
): IMsg => {
  switch (msg) {
    case 'JSON':
      return new JSONMsg(...props as ConstructorParameters<typeof JSONMsg>);
    case 'HL7v2':
      return new HL7v2Msg(...props as ConstructorParameters<typeof HL7v2Msg>);
    default:
      throw new Error(`Unknown message type ${msg}`);
  }
};
