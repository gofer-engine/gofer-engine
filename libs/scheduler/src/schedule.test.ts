import JSONMsg from '@gofer-engine/json';
import { logger } from '@gofer-engine/logger';
import {
  getChannelVar,
  getGlobalVar,
  setChannelVar,
  setGlobalVar,
} from '@gofer-engine/variables';

import { getMessages, schedulerServer } from './schedulerServer';

const channelId = 'sftp-test-getMessage';

const context = (channelId) => ({
  getChannelVar: getChannelVar(channelId),
  getGlobalVar: getGlobalVar,
  logger: logger({ channelId, direct: true }),
  setChannelVar: setChannelVar(channelId),
  setGlobalVar: setGlobalVar,
});

test('getMessages with sftp', (done) => {
  getMessages(
    {
      kind: 'sftp',
      sftp: {
        connection: {
          host: 'sftp',
          port: 22,
          username: 'foo',
          password: 'pass',
        },
        directory: '/upload/',
        filterOptions: {
          filenameRegex: '^test\\.json$'
        }
      },
    },
    context(channelId),
    (_t, msg) => new JSONMsg(msg),
  ).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg).toBeDefined();
    expect(msg.json()).toBe('true'), done();
  });
});

test('getMessages with function', (done) => {
  getMessages(() => new JSONMsg('true')).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg).toBeDefined();
    expect(msg.json()).toBe('true'), done();
  });
});

test('getMessages with function return array', (done) => {
  getMessages(() => [new JSONMsg('true')]).then((msgs) => {
    expect(msgs).toBeDefined();
    expect(msgs.length).toBe(1);
    const msg = msgs[0];
    expect(msg).toBeDefined();
    expect(msg.json()).toBe('true'), done();
  });
});

test('scheduleServer only invoke', (done) => {
  const channelId = 'invokeScheduleServer';
  const mocked = jest.fn();
  Promise.resolve(
    schedulerServer(
      channelId,
      {
        runner: () => new JSONMsg('true'),
      },
      undefined,
      'error',
      () => {
        mocked();
        return Promise.resolve(true);
      },
      context(channelId),
      () => new JSONMsg('true'),
    ),
  ).then((job) => {
    expect(job).toBeDefined();
    expect(job.name).toBe(channelId);
    job.addListener('run', () => console.log('run'));
    expect(job.listenerCount('run')).toBe(1);
    job.invoke();
    // wait for 3 seconds
    setTimeout(() => {
      expect(mocked).toBeCalledTimes(1);
      done();
    }, 200);
  });
});

test('scheduleServer only at date', (done) => {
  const channelId = 'dateScheduleServer';
  const when = Date.now() + 1000;
  const mocked = jest.fn();
  Promise.resolve(
    schedulerServer(
      channelId,
      {
        runner: () => new JSONMsg('true'),
        schedule: new Date(when),
      },
      undefined,
      'error',
      () => {
        mocked();
        return Promise.resolve(true);
      },
      context(channelId),
      () => new JSONMsg('true'),
    ),
  ).then((job) => {
    expect(job).toBeDefined();
    expect(job.name).toBe(channelId);
    expect(job.nextInvocation().getTime()).toBe(when);
    setTimeout(() => {
      expect(mocked).toBeCalledTimes(1);
      done();
    }, 1200);
  });
});

test('scheduleServer every second', (done) => {
  const channelId = 'everySecondScheduleServer';
  const now = Date.now();
  const mocked = jest.fn();
  Promise.resolve(
    schedulerServer(
      channelId,
      {
        runner: () => new JSONMsg('true'),
        schedule: {
          second: null,
        },
      },
      undefined,
      'error',
      () => {
        mocked();
        console.log('every second but only twice', new Date().toISOString());
        return Promise.resolve(true);
      },
      context(channelId),
      () => new JSONMsg('true'),
    ),
  ).then((job) => {
    expect(job).toBeDefined();
    expect(job.name).toBe(channelId);
    expect(job.nextInvocation().getTime()).toBeLessThanOrEqual(now + 1000);
    // after 2.2 seconds the mocked function should be called twice,
    // then we cancel the next invocation(s)
    setTimeout(() => {
      expect(mocked).toBeCalledTimes(2);
    }, 2100);
    // after another 1 second, the mocked function should be called once more
    setTimeout(() => {
      expect(mocked).toBeCalledTimes(3);
      job.cancelNext(false);
      done();
    }, 3100)
  });
});



test('scheduleServer on cron', (done) => {
  const channelId = 'cronScheduleServer';
  const now = Date.now();
  // get next month at 9:30 AM. and store as nextRun constant
  const nextRun = new Date();
  nextRun.setMonth(nextRun.getMonth() + 1)
  nextRun.setDate(1);
  nextRun.setHours(9, 30, 0, 0);
  const mocked = jest.fn();
  Promise.resolve(
    schedulerServer(
      channelId,
      {
        runner: () => new JSONMsg('true'),
        schedule: {
          // start tomorrow at midnight
          // NOTE: this is just in case today is the first and before 9:30 AM.
          start: new Date(now + 24 * 60 * 60 * 1000),
          // first day of month at 9:30 AM.
          rule: '30 9 1 * *',
        },
      },
      undefined,
      'error',
      () => {
        mocked();
        return Promise.resolve(true);
      },
      context(channelId),
      () => new JSONMsg('true'),
    ),
  ).then((job) => {
    expect(job).toBeDefined();
    expect(job.name).toBe(channelId);
    expect(job.nextInvocation().getTime()).toBe(nextRun.getTime());
    // after 0.1 seconds the should not have been called yet
    // then we cancel the next 1 invocation, but reschedule the next one.
    setTimeout(() => {
      expect(mocked).toBeCalledTimes(0);
      job.cancelNext(true);
    }, 100);
    // after another 0.1 seconds, the next invocation should have been rescheduled.
    setTimeout(() => {
      nextRun.setMonth(nextRun.getMonth() + 1);
      expect(job.nextInvocation().getTime()).toBe(nextRun.getTime());
      done();
    }, 200)
  });
});
