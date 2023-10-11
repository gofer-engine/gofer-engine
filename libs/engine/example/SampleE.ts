import { ChannelConfig } from '../src/types';

// this channel config is used in the tests and is not meant to be ran directly.
// Instead you can run the equivalent of this config by running the code in the
// tests/oom.test.ts named 'Basic OOP Config'
export const SampleE: ChannelConfig<'B', 'B', 'S'> = {
  id: 'b5c38041-9754-4108-a847-0a8760eda4ee',
  name: 'obnoxious-amaranth-rooster',
  source: {
    kind: 'tcp',
    tcp: {
      host: 'localhost',
      port: 5501,
    },
  },
  ingestion: [
    {
      id: '500f9f18-a8bb-4171-9e94-22c3b681c505',
      kind: 'flow',
      // flow: (msg) => msg.set('MSH-4.1', 'Gofer'),
      flow: expect.any(Function),
    },
    {
      id: 'cb69ed12-f2dc-4369-912c-1ac54e9c315d',
      kind: 'flow',
      flow: {
        kind: 'ack',
        ack: {},
      },
    },
    {
      id: '2174f3fc-ecd3-40c1-9d82-25f02242c57b',
      kind: 'flow',
      flow: {
        kind: 'store',
        file: {},
      },
    },
  ],
  routes: [
    {
      id: 'a0ca7ad8-e71f-4831-8586-d25e1755e429',
      kind: 'route',
      flows: [
        {
          id: '05352390-7f44-40a7-86c7-2b7c4241aa6a',
          kind: 'flow',
          // flow: (m) => m.get('MSH-9.2') === 'ADT',
          flow: expect.any(Function),
        },
        {
          id: 'bbb654cc-312f-458c-87b3-4fc7577706ee',
          kind: 'flow',
          flow: {
            kind: 'tcp',
            tcp: {
              host: 'localhost',
              port: 5502,
            },
          },
        },
        {
          id: 'b99e923b-c5f8-4e7a-a251-d8955d691c7b',
          kind: 'flow',
          flow: {
            kind: 'store',
            file: {
              path: ['local', 'acks'],
            },
          },
        },
      ],
    },
  ],
};
