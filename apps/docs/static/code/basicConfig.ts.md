```ts title="/src/basicConfig.ts"
import gofer, { ChannelConfig } from '@gofer-engine/engine';

const testChannel: ChannelConfig = {
  id: 'daf4518a-9097-11ee-b9d1-0242ac120002',
  name: 'test',
  logLevel: 'warn',
  source: {
    kind: 'tcp',
    tcp: {
      host: 'localhost',
      port: 8070,
      msgType: 'HL7v2',
      maxConnections: 3,
    },
    queue: {
      kind: 'queue',
      store: 'memory',
      concurrent: 1,
      filo: false,
      afterProcessDelay: 1000,
      msgType: 'HL7v2',
      rotate: false,
      retries: 3,
    },
  },
  ingestion: [
    {
      kind: 'filter',
      filter: (msg, { setMsgVar, logger, messageId }) => {
        if (msg.get('MSH-9.1') !== 'ADT') {
          logger(`Received non ADT Message`, 'warn')
          return false;
        }
        setMsgVar(messageId, 'version', msg.get('MSH-12'))
        return true;
      },
    },
    {
      kind: 'store',
      mongo: {
        uri: 'mongodb://mongo.your-hospital.com:27017',
        database: 'hl7',
        collection: 'adt',
        normalized: true,
        id: 'UUID',
        options: {
          auth: {
            username: process.env['MONGO_USER'],
            password: process.env['MONGO_PASS'],
          }
        }
      }
    },
    {
      kind: 'transform',
      transform: (msg) => {
        return msg
          // delete all EVN segments
          .delete('EVN')
          // copy PID-18 to PV1-19
          .copy('PID.18', 'PV1-19')
          // renumber all custom ZZZ segments
          .map('ZZZ', <T>(_: T, i: number) => 
            (i+1).toString() as T
          )
      },
    },
    {
      kind: 'ack',
      ack: {
        application: 'gofer-engine',
        organization: 'your-org',
      },
    },
  ]
};

gofer.configs([testChannel]);```
