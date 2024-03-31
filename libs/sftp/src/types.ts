import { MsgTypes } from '@gofer-engine/message-type';
import SFTP from 'ssh2-sftp-client';

export type MaybeArray<T> = T | T[];

export type FileFilterOptions = {
  ignoreDotFiles?: boolean;
  filename?: string;
  filenameRegex?: string;
  fileAgeMinMS?: number;
  fileAgeMaxMS?: number;
  fileDateMin?: Date;
  fileDateMax?: Date;
  fileSizeMinBytes?: number;
  fileSizeMaxBytes?: number;
  sortFilesBy?: 'name' | 'size' | 'date';
}

export type WriteOptions = {
  overwrite?: boolean;
  append?: boolean;
  // use null for binary
  encoding?: string | null;
  // example 0o666 = -rw-rw-rw-
  mode?: number | string;
}

export type AfterProcess = {
  action: 'delete' | 'move' | 'none';
  directory?: string;
  filename?: string; // if undefined, use original filename
}

export type SFTPWriteConfig = {
  connection: SFTP.ConnectOptions;
  filename: string;
  directory?: string;
  writeOptions?: WriteOptions;
};

export type SFTPReadConfig = {
  connection: SFTP.ConnectOptions;
  // FIXME: use msgType in src code.
  msgType?: MsgTypes;
  filterOptions?: FileFilterOptions;
  directory?: string;
  afterProcess?: AfterProcess;
  // _onErrorAction?: 'delete' | 'move' | 'none';
  // _onErrorDirectory?: string;
  // _onErrorFilename?: string;
  encoding?: BufferEncoding;
};
