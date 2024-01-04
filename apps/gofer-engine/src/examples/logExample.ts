import gofer from '@gofer-engine/engine';
import handelse from '@gofer-engine/handelse';
import fs from 'fs';

const logStream = fs.createWriteStream('/tmp/gofer.log', { flags: 'a', autoClose: true });

const LOGGER = handelse.get<string>('LOGGER');

LOGGER.removeAll();

LOGGER.sub((log) => {
  logStream.write(log + '\n');
  return true;
});

gofer
  .listen('tcp', 'localhost', 5575)
  .logLevel('debug')
  .filter((msg, context) => {
    const isFemale = msg.get('PID-8')==='F';
    const { messageId, logger } = context;
    if (!isFemale) {
      logger(`Msg ${messageId} was not a Female`, 'info');
    }
    return isFemale;
  })
  .run();
