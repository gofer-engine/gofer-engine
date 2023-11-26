import { IMessageContext } from '@gofer-engine/message-type';
import SFTP from 'ssh2-sftp-client';
import { Promisable } from 'type-fest';
import { MaybeArray, WriteOptions } from "./types";

// TODO: support streaming from local file system to SFTP for large files

export const writeSFTPMessages = (
  options: SFTP.ConnectOptions,
  messages: MaybeArray<
    Promisable<{
      name: string;
      msg: string;
      context: IMessageContext;
    }>
  >,
  directory = '/',
  writeOptions?: WriteOptions,
): Promise<boolean> => {
  const {
    overwrite = false,
    append = false,
    encoding = 'utf8',
    mode,
  } = writeOptions || {};
  if (Array.isArray(messages) && messages.length === 0) {
    // Nothing to do, so return true
    return Promise.resolve(true);
  }
  const sftp = new SFTP();
  return sftp.connect(options)
    .then(() => {
      if (!Array.isArray(messages)) {
        messages = [messages];
      }
      return Promise.all(messages.map((msg) => {
        return Promise.resolve(msg).then(({ name, msg, context }) => {
          const filepath = `${directory}${name}`
          return new Promise<void>((res, rej) => {
            const flag = overwrite ? 'w' : append ? 'a' : undefined;
            // TODO: check if path exists as link or directory too
            if (flag === undefined) {
              return sftp.exists(filepath).then((filetype) => {
                if (!filetype) {
                  // File does not exist, so we can write
                  return res();
                }
                if (filetype === '-') {
                  return rej(`File \`${filepath}\` already exists and overwrite and append are both false`)
                }
              })
            }
            return res();
          }).then(() => {
            return sftp
              .put(Buffer.from(msg), filepath, {
                writeStreamOptions: {
                  encoding,
                  mode,
                  flags: overwrite ? 'w' : append ? 'a' : 'w',
                }
              })
              .then(() => {
                context.logger(`Wrote SFTP file: \`${filepath}\``, 'info');
                return true
              })
          })
          .catch((err) => {
            // FIXME: this error is not being caught anywhere in the tests
            context.logger(JSON.stringify(err), 'error')
            return false;
          })
        })
      }))
    })
    .then(result => result.every(r => r))
};
