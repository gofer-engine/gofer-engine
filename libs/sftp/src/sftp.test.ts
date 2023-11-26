import JSONMsg from '@gofer-engine/json';
import { readSFTPMessages } from './readSFTPMessages';
import { writeSFTPMessages } from './writeSFTPMessages';
import {
  getChannelVar,
  getGlobalVar,
  getMsgVar,
  setChannelVar,
  setGlobalVar,
  setMsgVar,
} from '@gofer-engine/variables';
import { logger } from '@gofer-engine/logger';
import { IMessageContext } from '@gofer-engine/message-type';
import { genId } from '@gofer-engine/tools';
import SFTP from 'ssh2-sftp-client';

test('readSFTPMessages', (done) => {
  readSFTPMessages(
    {
      host: 'sftp',
      port: 22,
      username: 'foo',
      password: 'pass',
    },
    'JSON',
    (_t, msg) => new JSONMsg(msg),
    '/upload/',
    {
      filename: 'test.json',
    },
  ).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg).toBeDefined();
    expect(msg.json()).toBe('true');
    done();
  });
});

test.skip('readFTPMessages', (done) => {
  // TODO: support FTP when there is a need for it.
  // NOTE: FTP nor FTPS are currently supported.
  readSFTPMessages(
    {
      host: 'ftp',
      port: 21,
      username: 'foo',
      password: 'pass',
    },
    'JSON',
    (_t, msg) => new JSONMsg(msg),
    '/',
    {
      filename: 'test.json',
    },
  ).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg).toBeDefined();
    expect(msg.json()).toBe('true'), done();
  });
});

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

test('writeSFTPMessages no messages', (done) => {
  writeSFTPMessages(
    {
      host: 'sftp',
      port: 22,
      username: 'foo',
      password: 'pass',
    },
    [],
    '/upload/',
    {
      encoding: 'utf8',
    },
  ).then((results) => {
    expect(results).toBe(true);
    done();
  });
});

test('writeSFTPMessages single message', (done) => {
  const connection = {
    host: 'sftp',
    port: 22,
    username: 'foo',
    password: 'pass',
  };
  // delete test file if it exists
  const sftp = new SFTP();
  sftp
    .connect(connection)
    .then(() => {
      return sftp.delete('/upload/foobar.json', true);
    })
    .then(() => {
      return writeSFTPMessages(
        connection,
        {
          name: 'foobar.json',
          msg: JSON.stringify(true),
          context: context('writeSingleSFTPMsg', genId('ID')),
        },
        '/upload/',
        {
          encoding: 'utf8',
        },
      ).then((results) => {
        expect(results).toBe(true);
        done();
      });
    });
});
