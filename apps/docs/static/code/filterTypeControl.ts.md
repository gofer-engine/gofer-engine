```ts title="/src/filterTypeControl.ts"
import { ChannelConfig } from '@gofer-engine/engine';

const functionalFilterChannel: ChannelConfig<'F'> = {
  name: 'Functional Filter Channel',
  source: { 
    kind: 'http',
    http: { host: 'localhost', port: 8081, method: 'POST', msgType: 'HL7v2' },
  },
  ingestion: [
    (msg) => msg.get('PV1.3.1') !== 'ER',
  ],
};

const objectFilterChannel: ChannelConfig<'O'> = {
  name: 'Functional Filter Channel',
  source: { 
    kind: 'https',
    https: { 
      host: 'localhost',
      port: 8082,
      method: 'POST',
      cert: process.env['SSL_CERT'],
      key: process.env['SSL_KEY'],
      msgType: 'HL7v2',
    },
  },
  ingestion: [
    {
      kind: 'filter',
      filter: (msg, { setMsgVar, messageId }) => {
        setMsgVar(messageId, 'name', `${msg.get('name.first')} ${msg.get('name.last')}`)
        return true;
      },
    }
  ],
};

// `ChannelConfig<'B'>` is same as default `ChannelConfig`
const mixedFilterChannel: ChannelConfig<'B'> = {
  name: 'Mixed Filter Channel',
  source: { 
    kind: 'sftp',
    sftp: {
      msgType: 'DELIMITED',
      connection: { 
        host: 'sftp.example.com',
        username: 'user',
        password: 'pass',
      }
    },
  },
  ingestion: [
    // require the header first column to be 'name'
    {
      kind: 'filter',
      filter: (msg) => msg.get('A0') === 'name',
    },
    // set the message variable 'name' to the array of names
    // this filter will always return true, just a shortcut
    // for setting a message variable
    (msg, { setMsgVar, messageId }) => {
      setMsgVar(messageId, 'names', msg.get('A').shift());
      return true;
    },
  ],
};

export const channels = [
  functionalFilterChannel,
  objectFilterChannel,
  mixedFilterChannel
];
```
