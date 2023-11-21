import { RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit } from 'node-schedule'
import { IMsg, MsgTypes } from '@gofer-engine/message-type';

export type SchedulerConfig = {
  msgType?: MsgTypes;
  runner: () => IMsg | IMsg[];
  schedule?: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number;
  runOnStart?: boolean;
};
