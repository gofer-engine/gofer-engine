```ts title="/src/serverConfig.ts"
import gofer, { ChannelConfig } from '@gofer-engine/engine'

const channel: ChannelConfig = {
  name: 'My First Channel',
  source: {
    kind: 'tcp',
    tcp: {
      host: 'localhost',
      port: 5500,
    },
  },
  ingestion: [
    { kind: 'ack', ack: {} },
    { kind: 'store', file: {} },
  ],
  routes: [],
};

gofer.configs([channel]);
```
