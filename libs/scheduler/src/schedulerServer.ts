import schedule from "node-schedule";

import { publishers } from "@gofer-engine/events";
import { GetMsgType, IContext, IMessageContext, IMsg, IngestMsgFunc, TLogLevel } from "@gofer-engine/message-type";

import { SchedulerConfig } from "./types";
import { getMsgVar, setMsgVar } from "@gofer-engine/variables";
import { randomUUID } from "crypto";
import { logger } from "@gofer-engine/logger";
import { getSFTPMessages } from "@gofer-engine/sftp";

export const getMessages = <
  C extends SchedulerConfig['runner']
>(
  runner: C,
  context?: C extends ()=>void ? never : IContext,
  getMsgType?: C extends ()=>void ? never : GetMsgType,
): Promise<IMsg[]> => {
  if (typeof runner === 'function') {
    return Promise.resolve(runner()).then((msgs) => {
      if (!Array.isArray(msgs)) {
        msgs = [msgs];
      }
      return msgs;
    });
  }
  if (runner.kind === 'sftp') {
    return getSFTPMessages(
      runner.sftp.connection,
      context.kind,
      getMsgType,
      runner.sftp.directory,
      runner.sftp.filterOptions,
    )
  }
  return Promise.reject(new Error(`Unknown runner kind ${runner.kind}`));
}

export const schedulerServer = (
  id: string | number,
  scheduleConfig: SchedulerConfig,
  queueConfig: unknown,
  logLevel: TLogLevel | undefined,
  ingestMessage: IngestMsgFunc,
  context: IContext,
  getMsgType: GetMsgType,
): schedule.Job => {
  if (queueConfig !== undefined) {
    publishers.onError(
      new Error(
        `Channel ${id} has a queue config in a scheduler server. This is not yet supported.`,
      ),
    );
  }
  const {
    msgType = "HL7v2",
    runner,
    schedule: sched,
    runOnStart = false,
  } = scheduleConfig;
  // TODO: do we need to check for non-unique job names? This id is the channel id
  const jobName = `${id}`;
  const job = () => {
    getMessages(
      runner,
      context,
      getMsgType,
    ).then((msgs) => {
      msgs.forEach((msg) => {
        // NOTE: this processes multiple messages asynchonously
        const msgUUID = randomUUID();
        const msgContext: IMessageContext = {
          ...context,
          kind: msgType,
          setMsgVar: setMsgVar(msgUUID),
          getMsgVar: getMsgVar(msgUUID),
          messageId: msgUUID,
          channelId: id,
          logger: logger({ channelId: id, msg })
        }
        ingestMessage(msg, () => {
          // NOTE: do nothing, no acks for scheduled jobs
        }, msgContext);
      });
    })
  }
  const Job = new schedule.Job(jobName, job)
  if (sched !== undefined) {
    // NOTE: the type for schedule is not correct. It does allow typof `sched`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Job.schedule(sched as any);
    if (logLevel === 'debug') {
      const log = (event: string) => () => context.logger(`Scheduled job ${jobName} ${event}`, `debug`)
      Job.addListener('run', log('run'));
      Job.addListener('scheduled', log('scheduled'));
      Job.addListener('canceled', log('canceled'));
      Job.addListener('error', log('error'));
      Job.addListener('success', log('success'));
    }
  }
  if (runOnStart) {
    Job.invoke();
  }
  return Job;
}