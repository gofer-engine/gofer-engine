import { IMsg } from '..';
import { IMessageContext } from '..';

export const functionalVal = <
  T extends string | number | object | boolean | undefined,
>(
  val: T | ((msg: IMsg, context: IMessageContext) => T),
  msg: IMsg,
  context: IMessageContext,
): T => {
  if (typeof val === 'function') return val(msg, context);
  return val;
};
