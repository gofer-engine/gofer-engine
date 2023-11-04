import { IMessageContext, IMsg } from '@gofer-engine/message-type';

export interface IStoreClass {
  store: StoreFunc;
  close: () => Promise<void>;
  query: (query: string) => Promise<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoreFunc = (data: IMsg, context: IMessageContext) => Promise<boolean>;

/**
 * @param id - When defined in the Store Config, this id prop accepts a HL7 reference like `$MSH-10.1`. Or can also use `UUID` to generate a universally unique identifier.
 * @ignore Some stores may not support externally assigned identifiers, so then `id` should simply be ignored.
 * @todo Support multiple HL7 references in a formatted reference like `${MSH-9.1}_${MSH-10-1}`
 */
export interface StoreOption {
  id?: string;
}

export const testContext: IMessageContext = {
  channelId: 'test',
  getChannelVar: () => undefined,
  logger: console.log,
  getGlobalVar: () => undefined,
  getMsgVar: () => undefined,
  routeId: 'test',
  kind: 'HL7v2',
  messageId: 'test',
  setChannelVar: () => undefined,
  setGlobalVar: () => undefined,
  setMsgVar: () => undefined,
};
