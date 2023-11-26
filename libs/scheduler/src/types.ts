import { RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit } from 'node-schedule'

import { IMsg, MsgTypes } from '@gofer-engine/message-type';
import { SFTPReadConfig } from '@gofer-engine/sftp';
import { Promisable } from 'type-fest';
import { FileReadConfig } from "@gofer-engine/file";

export type GetMsgFunc = () => Promisable<IMsg | IMsg[]>;

export type SFTPConnection = {
  kind: 'sftp';
  sftp: SFTPReadConfig;
}

export type FileConnection = {
  kind: 'file';
  file: FileReadConfig;
}

export type SchedulerConfig = {
  msgType?: MsgTypes;
  runner: 
    | SFTPConnection
    | FileConnection
    | GetMsgFunc;
  schedule?: RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number;
  runOnStart?: boolean;
};
