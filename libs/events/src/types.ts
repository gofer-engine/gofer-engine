import { SubFunc, SubscriberID } from "@gofer-engine/handelse";
import { IChannelEvents, IMsg } from "@gofer-engine/message-type";

export type TListeners = {
  // onGoferStart: (handler: SubFunc<Date>) => SubscriberID;
  // preChannelInit: (handler: SubFunc<ChannelConfig>) => SubscriberID;
  onError: (handler: SubFunc<Error>) => SubscriberID;
  onLog: (handler: SubFunc<unknown>) => SubscriberID;
  channels: Record<string, IChannelEvents<IMsg>>;
};