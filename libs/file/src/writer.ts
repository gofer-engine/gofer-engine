import fs from 'fs';
import { Promisable } from "type-fest";
import { MaybeArray, WriteOptions } from "./types";
import { IMessageContext } from "@gofer-engine/message-type";

export const writer = (
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
  } = writeOptions || {};
  if (Array.isArray(messages) && messages.length === 0) {
    // Nothing to do, so return true
    return Promise.resolve(true);
  }
  if (!Array.isArray(messages)) {
    messages = [messages];
  }
  return Promise.all(messages.map((msg) => {
    return Promise.resolve(msg).then(async ({ name, msg, context }) => {
      const filepath = `${directory}${name}`
      // w = write, a = append, xw = overwrite if exist
      const flag = overwrite ? 'w' : append ? 'a' : 'wx';
      return new Promise<boolean>((res) => {
        return fs.writeFile(filepath, msg, {
          encoding,
          flag,
        }, (err) => {
          if (err) {
            context.logger(JSON.stringify(err), 'error');
            return res(false);
          }
          return res(true);
        })
      })
    })
  })).then((results) => results.every((result) => result));
}