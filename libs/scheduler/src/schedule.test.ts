import JSONMsg from '@gofer-engine/json';
import { logger } from '@gofer-engine/logger';
import { getChannelVar, getGlobalVar, setChannelVar, setGlobalVar } from '@gofer-engine/variables';

import { getMessages } from './schedulerServer'

const testChannelId = 'sftp-test-getMessage';

test('SFTP.getMessages', (done) => {
  getMessages(
    {
      kind: 'sftp',
      sftp: {
        connection: {
          host: 'localhost',
          port: 2222,
          username: 'foo',
          password: 'pass',
        },
        directory: '/upload/',

      },
    },
    {
      getChannelVar: getChannelVar(testChannelId),
      getGlobalVar: getGlobalVar,
      logger: logger({ channelId: testChannelId }),
      setChannelVar: setChannelVar(testChannelId),
      setGlobalVar: setGlobalVar,
    },
    (_t, msg) => new JSONMsg(msg),
  ).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg).toBeDefined();
    expect(msg.json()).toBe("true"),
    done();
  })
});

test('SFTP.getMessages with function', (done) => {
  getMessages(
    () => new JSONMsg('true')
  ).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg).toBeDefined();
    expect(msg.json()).toBe("true"),
    done();
  })
});

test('SFTP.getMessages with function array', (done) => {
  getMessages(
    () => [new JSONMsg('true')]
  ).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg).toBeDefined();
    expect(msg.json()).toBe("true"),
    done();
  })
});
