import { DelimitedMsg } from '@gofer-engine/delimited';
import HL7v2Msg from '@gofer-engine/hl7';
import { JSONMsg } from '@gofer-engine/json';
import {
  GetMsgType,
  IDelimitedOptions,
  IMsg,
  MsgTypes,
} from '@gofer-engine/message-type';
import XMLMsg from '@gofer-engine/xml';

type MsgProps<T extends MsgTypes> = T extends 'HL7v2'
  ? ConstructorParameters<typeof HL7v2Msg>
  : T extends 'JSON'
  ? ConstructorParameters<typeof JSONMsg>
  : T extends 'XML'
  ? ConstructorParameters<typeof XMLMsg>
  : T extends 'DELIMITED' | { kind: 'DELIMITED'; options: IDelimitedOptions }
  ? ConstructorParameters<typeof DelimitedMsg>
  : never;

export const getMsgType: GetMsgType = <T extends MsgTypes>(
  msg: T,
  ...props: MsgProps<T>
): IMsg => {
  if (typeof msg === 'string') {
    switch (msg) {
      case 'JSON':
        return new JSONMsg(...(props as ConstructorParameters<typeof JSONMsg>));
      case 'HL7v2':
        return new HL7v2Msg(
          ...(props as ConstructorParameters<typeof HL7v2Msg>),
        );
      case 'XML':
        return new XMLMsg(...(props as ConstructorParameters<typeof XMLMsg>));
      case 'DELIMITED':
        return new DelimitedMsg(
          ...(props as ConstructorParameters<typeof DelimitedMsg>),
        );
      default:
        throw new Error(`Unknown message type ${msg}`);
    }
  }
  if (msg.kind === 'DELIMITED') {
    return new DelimitedMsg(
      (props as ConstructorParameters<typeof DelimitedMsg>)[0],
      msg.options,
    );
  }
  throw new Error(`Unknown message type ${msg}`);
};
