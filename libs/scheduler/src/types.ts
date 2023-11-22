import { RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit } from 'node-schedule'

import { IMsg, MsgTypes } from '@gofer-engine/message-type';
import { SFTPConfig } from '@gofer-engine/sftp';

export type SchedulerConfig = {
  msgType?: MsgTypes;
  runner: {
    kind: 'sftp'
    sftp: SFTPConfig
  } | (() => IMsg | IMsg[]);
  schedule?: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number;
  runOnStart?: boolean;
};
