import SFTP from 'ssh2-sftp-client';

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

export type SFTPConfig = {
  connection: SFTP.ConnectOptions;
  filterOptions?: FileFilterOptions;
  directory?: string;
  _afterProcessAction?: 'delete' | 'move' | 'none';
  _moveDirectory?: string;
  _moveFilename?: string;
  _onErrorAction?: 'delete' | 'move' | 'none';
  _onErrorDirectory?: string;
  _onErrorFilename?: string;
  _encoding?: string;
};