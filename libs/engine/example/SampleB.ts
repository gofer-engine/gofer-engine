import { Seg } from '@gofer-engine/hl7'
import { ChannelConfig } from '../src/types'

const SampleB: ChannelConfig = {
  id: 'sample-b',
  logLevel: 'info',
  name: 'Sample B',
  source: {
    kind: 'tcp',
    tcp: {
      host: '0.0.0.0',
      port: 9001,
    },
  },
  ingestion: [
    {
      kind: 'flow',
      id: 'ack',
      name: 'Send Acknowledgement',
      flow: {
        kind: 'ack',
        ack: {
          application: 'SampleB',
          organization: '$MSH-5',
        },
      },
    },
    {
      kind: 'flow',
      id: 'file',
      name: 'Persist to File',
      flow: {
        kind: 'store',
        file: {}, // persists the original message
      },
    },
    (msg) => msg, // by returning the same message, this transformer is not actually doing anything, just showing that you can add a transformer later on in the flow.
    () => true, // by returning true this filter is not actually doing anything, just showing that you can add a filter later on in the flow.
    {
      // by returning true this filter is not actually doing anything, just showing that you can add a filter later on in the flow.
      kind: 'filter',
      filter: () => true,
    },
    {
      // by returning the same message, this transformer is not actually doing anything, just showing that you can add a transformer later on in the flow.
      kind: 'transform',
      transform: (msg) => msg,
    },
    {
      // this ack is never processed because there is another ack in the flow already.
      kind: 'ack',
      ack: {},
    },
  ],
  routes: [
    {
      kind: 'route',
      id: 'route1',
      name: 'First Route',
      queue: {
        kind: 'queue',
        verbose: true,
        store: 'memory',
      },
      flows: [
        {
          kind: 'flow',
          id: 'b01Filter',
          name: 'Only Accept B01 Events',
          flow: {
            kind: 'filter',
            filter: (msg) => msg.get('MSH-9.2') === 'B01', // a filter is a function that accepts the Msg class and returns a boolean.
          },
        },
        (msg) => msg.move('LAN-2', 'LAN-6'), // a transformer is a function that accepts the Msg class and returns the Msg class.
        { kind: 'store', file: {} }, // a store is a object that conforms to IDBStoreOptions. NOTE: only one store is supported in each object.
        { kind: 'store', surreal: {
          id: 'UUID',
          uri: 'http://127.0.0.1:8000/rpc',
          verbose: true,
          warnOnError: true,
          namespace: 'MyProject',
          database: '$MSH.9.1',
          table: '$MSH.9.2',
        } }, // But we can still persists to multiple stores.
        (msg) => (msg.get('LAN') as Seg[])?.length > 1, // you can add a filter later on in the flow too.
        { kind: 'store', file: { filename: '$EVN-2' } }, // And we can even persist it again with different settings
        {
          kind: 'flow',
          flow: {
            // send the message to a tcp server
            kind: 'tcp',
            tcp: {
              host: '0.0.0.0',
              port: 9003,
            },
          },
          queue: {
            kind: 'queue',
            store: 'memory',
          },
        },
        {
          // persist the ack received back
          kind: 'store',
          file: {
            filename: ['$MS-10.1', '_ACK'],
          },
        },
      ],
    },
  ],
}

export default SampleB
