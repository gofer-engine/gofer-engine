import fs from 'fs';
import JSONMsg from "@gofer-engine/json";
import { reader } from './reader'
import { writer } from './writer'
import { IMessageContext } from "@gofer-engine/message-type";
import { logger } from "@gofer-engine/logger";
import { getChannelVar, getGlobalVar, setChannelVar, setGlobalVar, getMsgVar, setMsgVar } from "@gofer-engine/variables";
import { genId } from "@gofer-engine/tools";

const context = (
  channelId: string | number,
  messageId: string,
): IMessageContext => ({
  getChannelVar: getChannelVar(channelId),
  getGlobalVar: getGlobalVar,
  logger: logger({ channelId, direct: true }),
  setChannelVar: setChannelVar(channelId),
  setGlobalVar: setGlobalVar,
  channelId,
  getMsgVar: getMsgVar(messageId),
  kind: 'JSON',
  messageId,
  setMsgVar: setMsgVar(messageId),
});

test('File reader', (done) => {
  reader(
    'JSON',
    (_t, msg) => new JSONMsg(msg),
    '/usr/src/app/samples/',
    {
      filename: 'test.json'
    },
    undefined,
    'utf8'
  ).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg.json()).toBe('true');
    done();
  })
});

test('File writer no messages', (done) => {
  writer([], '/usr/src/app/samples/').then((results) => {
    expect(results).toBe(true);
    done();
  });
});

test('File writer no messages', (done) => {
  fs.rmSync('/usr/src/app/samples/baz.json', { force: true });
  writer(
    {
      name: 'baz.json',
      msg: JSON.stringify({ foo: 'bar' }),
      context: context('writeSingleFileMsg', genId('ID')),
    },
    '/usr/src/app/samples/'
  ).then((results) => {
    expect(results).toBe(true);
    done();
  });
});
