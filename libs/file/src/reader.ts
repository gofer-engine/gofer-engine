import fs from 'fs';
import { GetMsgType, IMsg, MsgTypes } from '@gofer-engine/message-type';
import { AfterProcess, FileFilterOptions } from './types';

export const reader = (
  messageTypes: MsgTypes,
  getMsgType: GetMsgType,
  directory = '/',
  filterOptions: FileFilterOptions = {},
  afterProcess?: AfterProcess,
  encoding?: BufferEncoding,
): Promise<IMsg[]> => {
  return new Promise<
    {
      filepath: string;
      file: string;
      size: number;
      mtimeMs: number;
      mtime: Date;
    }[]
  >((res, rej) => {
    const now = Date.now();
    return fs.readdir(directory, (err, files) => {
      if (err) {
        return rej(err);
      }
      const {
        ignoreDotFiles = true,
        fileSizeMaxBytes = 1000000000, // 1Gb I think?
        fileSizeMinBytes = 0, // 0 bytes
        filename,
        filenameRegex,
        fileAgeMinMS,
        fileAgeMaxMS,
        fileDateMin,
        fileDateMax,
        sortFilesBy = 'date',
      } = filterOptions;
      const fileStats = files
        .map((file) => {
          const filepath = `${directory}${file}`;
          const { size, mtimeMs, mtime } = fs.statSync(filepath);
          return {
            filepath,
            file,
            size,
            mtimeMs,
            mtime,
          };
        })
        .filter(({ file, size, mtimeMs, mtime }) => {
          if (ignoreDotFiles && file.startsWith('.')) {
            return false;
          }
          if (filename && file !== filename) {
            return false;
          }
          if (filenameRegex && !new RegExp(filenameRegex).test(file)) {
            return false;
          }
          if (size > fileSizeMaxBytes || size < fileSizeMinBytes) {
            return false;
          }
          if (fileAgeMinMS !== undefined && now - mtimeMs < fileAgeMinMS) {
            return false;
          }
          if (fileAgeMaxMS !== undefined && now - mtimeMs > fileAgeMaxMS) {
            return false;
          }
          const modifiedDate = new Date(mtime);
          if (fileDateMin && modifiedDate < fileDateMin) {
            return false;
          }
          if (fileDateMax && modifiedDate > fileDateMax) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (sortFilesBy === 'name') {
            return a.file.localeCompare(b.file);
          }
          if (sortFilesBy === 'date') {
            return a.mtimeMs - b.mtimeMs;
          }
          if (sortFilesBy === 'size') {
            return a.size - b.size;
          }
          return 0;
        });
      // res(fileStats.map((stats) => stats.filepath))
      res(fileStats);
    });
  }).then((files) => {
    return files.map((file) => {
      const {
        action = 'none',
        // TODO: support variables in directory
        directory: moveDirectory = directory + 'archived/',
        // TODO: support variables in filename
        filename = file.file,
      } = afterProcess || {};
      const str = fs.readFileSync(file.filepath, encoding);
      if (action === 'delete') {
        // TODO: log deletion success or failure
        fs.rmSync(file.filepath);
      }
      if (action === 'move') {
        // TODO: log move success or failure
        fs.renameSync(file.filepath, `${moveDirectory}${filename}`);
      }
      return getMsgType(messageTypes, str);
    });
  });
};
