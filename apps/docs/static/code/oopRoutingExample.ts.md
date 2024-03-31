```ts title="/src/oopRoutingExample.ts"
import gofer from '@gofer-engine/engine';

const ListenAndAck = gofer.listen('tcp', 'localhost', 5605).ack();

const singleRoute = ListenAndAck.route((route) =>
  route
    .name('A Unique Route Name')
    .id(42)
    .filter((msg) => msg.get('MSH-9.1') === 'ORM')
    .transform((msg) => msg.set('MSH-5', 'Gofer Engine'))
    .store({ file: {} })
    .setVar('Msg', 'name', 'John Doe')
    .setVar('Channel', 'facility', (msg) => msg.get('MSH-3.1'))
    .setVar<{ bar: string }>('Global', 'foo', { bar: 'baz' })
    .setMsgVar('name', 'John Doe')
    .setRouteVar<number>('port', 5808)
    .setChannelVar('facility', (msg) => msg.get('MSH-3.1'))
    .setGlobalVar<{ bar: string }>('foo', { bar: 'baz' })
    .getVar('Msg', 'name', (name) => console.log(name))
    .getMsgVar('name', (name, msg) => msg.set('PID-5.2', name))
    .getRouteVar('port', (port, _msg, context) =>
      context.logger(`Using port ${port}`, 'debug'),
    )
    .getChannelVar<string>('facility', (facility, _, { logger }) => {
      logger(`Received message from ${facility}`, 'info');
    })
    .getGlobalVar<{ bar: string }>('foo', ({ bar }, msg) =>
      msg.set('NTE-2', bar),
    )
    .send('tcp', 'ehr.example.com', 5700)
    .send(
      'tcp',
      (_msg, { getChannelVar }) =>
        `${getChannelVar<string>('facility')}.example.com`,
      (_msg, context) => context.getRouteVar<number>('port'),
    ),
);

const multiRoute = ListenAndAck.routes((routes) => [
  routes()
    .name('A Unique Route Name 1')
    .send('https', {
      host: 'ehr.example.com',
      port: 443,
      basicAuth: {
        username: 'user',
        password: 'pass',
      },
      rejectUnauthorized: false,
    })
    .store({ file: {} }),
  routes().name('A Unique Route Name 2').store({ dgraph: {} }),
]);
```
