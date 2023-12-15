```ts title="/src/advancedAck.ts"
import gofer from '@gofer-engine/engine'
import { AckConfig } from '@gofer-engine/message-type';

const ackProcess: AckConfig['msg'] = (ack, msg, { filtered }) => {
  if (filtered) {
    return ack
      .set('MSA-2', 'AR')
      .set('MSA-3', `${msg.get('PID-3[1].1')} was filtered`)
  }
  return ack.set('MSA-3', `${msg.get('PID-3[1].1')} was accepted`)
}

// OOP Style
gofer
  .listen('tcp', 'localhost', 5501)
  .name('Example Channels with OOP')
  .ack({
    msg: ackProcess
  })
  .run();

// Config Style
gofer.configs([{
  name: 'Example Channels with Configs',
  source: {
    kind: 'tcp',
    tcp: {
      host: 'localhost',
      port: 9002,
    },
  },
  ingestion: [
    {
      kind: 'ack',
      ack: {
        msg: ackProcess
      },
    },
  ],
}]);
```
