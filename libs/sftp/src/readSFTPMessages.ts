import { GetMsgType, IMsg, MsgTypes } from '@gofer-engine/message-type'
import SFTP from 'ssh2-sftp-client'
import { AfterProcess, FileFilterOptions } from './types'

export const readSFTPMessages = (
  options: SFTP.ConnectOptions,
  messageTypes: MsgTypes,
  getMsgType: GetMsgType,
  directory = '/',
  filterOptions: FileFilterOptions = {},
  afterProcess?: AfterProcess,
  encoding?: BufferEncoding,
): Promise<IMsg[]> => {
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
  const sftp = new SFTP();
  const now = Date.now();
  return sftp.connect(options)
    .then(() => {
      return sftp.list(directory)
    })
    .then((files) => {
      return files.filter((file) => {
        if (ignoreDotFiles && file.name.startsWith('.')) {
          return false
        }
        if (filename && file.name !== filename) {
          return false
        }
        if (file.size > fileSizeMaxBytes || file.size < fileSizeMinBytes) {
          return false
        }
        if (fileAgeMinMS !== undefined && now - file.modifyTime < fileAgeMinMS) {
          return false
        }
        if (fileAgeMaxMS !== undefined && now - file.modifyTime > fileAgeMaxMS) {
          return false
        }
        if (fileDateMin && file.modifyTime < fileDateMin.getTime()) {
          return false
        }
        if (fileDateMax && file.modifyTime > fileDateMax.getTime()) {
          return false
        }
        if (filenameRegex && !new RegExp(filenameRegex).test(file.name)) {
          return false
        }
        return true;
      }).sort((a, b) => {
        if (sortFilesBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortFilesBy === 'date') {
          return a.modifyTime - b.modifyTime;
        }
        if (sortFilesBy === 'size') {
          return a.size - b.size;
        }
        return 0;
      })
    }).then((files) => {
      return files.map((file) => {
        const buffer = sftp.get(`${directory}${file.name}`) as Promise<Buffer>
        return buffer
        .then((buf) => buf.toString(encoding))
        .then(async (str) => {
          const {
            action = 'none',
            // TODO: support variables in directory
            directory: moveDirectory = directory + 'archived/',
            // TODO: support variables in filename
            filename = file.name,
          } = afterProcess || {}
          if (action === 'delete') {
            await sftp
              .delete(`${directory}${file.name}`)
              .then((result) => {
                // TODO: log this result
              })
              .catch((err) => {
                // TODO: log this err
              })
          }
          if (action === 'move') {
            await sftp
              .rename(`${directory}${file.name}`, `${moveDirectory}${filename}`)
              .then((result) => {
                // TODO: log this result
              })
              .catch((err) => {
                // TODO: log this err
              })
          }
          return getMsgType(messageTypes, str)
        })
      })
    }).then((files) => {
      return Promise.all(files)
    }).finally(() => {
      sftp.end();
    })
}