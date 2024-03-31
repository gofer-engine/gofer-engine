```ts title="/src/basicAck.ts"
import gofer from '@gofer-engine/engine'

// OOP style
gofer
  .listen('tcp', 'localhost', 5501)
  .name('Example Channels with OOP')
  .ack()
  .run()

// Config style
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
      ack: {},
    },
  ],
}]);
```
