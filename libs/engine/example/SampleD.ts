import { ChannelConfig } from '../src/';

const ChannelD: ChannelConfig = {
  logLevel: 'debug',
  name: 'Channel D',
  source: {
    kind: 'tcp',
    tcp: {
      host: '0.0.0.0',
      port: 5555,
    },
  },
  ingestion: [
    {
      kind: 'ack',
      ack: { organization: 'MyProject' },
    },
    {
      kind: 'flow',
      id: 'IngestionStore',
      flow: {
        kind: 'store',
        surreal: {
          id: 'UUID',
          uri: 'http://127.0.0.1:8000/rpc',
          verbose: true,
          warnOnError: true,
          namespace: 'MyProject',
          database: '$MSH.9.1',
          table: '$MSH.9.2',
        },
      },
    },
  ],
};

export default ChannelD;
