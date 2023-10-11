import Msg from '@gofer-engine/hl7';
import { randomUUID } from 'crypto';
import { ChannelConfig } from '../src/types';

const SampleA: ChannelConfig = {
  logLevel: 'debug',
  name: 'Sample A',
  source: {
    kind: 'tcp',
    tcp: {
      host: '0.0.0.0',
      port: 9002,
    },
    queue: {
      kind: 'queue',
      verbose: false,
      store: 'file',
      id: (msg) => (msg.get('MSH-10.1') as string | undefined) ?? randomUUID(),
      stringify: (msg) => msg.toString(),
      parse: (msg) => new Msg(msg),
    },
  },
  ingestion: [
    {
      kind: 'ack',
      ack: {
        organization: 'My Organization',
      },
    },
  ],
  routes: [[{ kind: 'store', file: {} }]],
};

export default SampleA;
