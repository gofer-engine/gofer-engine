import { RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit } from 'node-schedule'

import { IMsg, MsgTypes } from '@gofer-engine/message-type';
import { SFTPConfig } from '@gofer-engine/sftp';
import { Promisable } from 'type-fest';

export type GetMsgFunc = () => Promisable<IMsg | IMsg[]>;

export type SchedulerConfig = {
  msgType?: MsgTypes;
  runner: {
    kind: 'sftp'
    sftp: SFTPConfig
  } | GetMsgFunc;
  schedule?: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number;
  runOnStart?: boolean;
};
