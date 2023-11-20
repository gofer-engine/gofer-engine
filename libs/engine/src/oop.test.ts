import { setLoggingConfig } from "@gofer-engine/events";
setLoggingConfig({ console: false });

import { gofer } from './gofer';
import { SampleE } from '../example/SampleE';

test('Basic OOP Config', () => {
  // NOTE: not initializing servers here, just testing config
  // so we don't need an open port nor need `localhost` to resolve
  const config = gofer
    .listen('tcp', 'localhost', 5501)
    .transform((msg) => msg.set('MSH-4.1', 'Gofer'))
    .ack()
    .store({ file: {} })
    .route((route) =>
      route
        .filter((m) => m.get('MSH-9.2') === 'ADT')
        .send('tcp', 'localhost', 5502)
        .store({ file: { path: ['local', 'acks'] } }),
    )
    .export();

  expect(config).toStrictEqual(SampleE);
});
