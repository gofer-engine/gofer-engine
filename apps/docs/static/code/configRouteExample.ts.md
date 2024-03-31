```ts title="/src/configRouteExample.ts"
import gofer, { ChannelConfig, Route, RouteFlow } from '@gofer-engine/engine';

const sendMsg: RouteFlow = {
  kind: 'tcp',
  tcp: {
    host: 'localhost',
    port: 5600,
    msgType: 'HL7v2',
  }
};

const storeAck: RouteFlow = {
  kind: 'store',
  file: {},
};

const route: Route = {
  kind: 'route',
  id: "ID_1",
  name: "Example Config Route 1",
  tags: [{ name: "Examples" }],
  flows: [sendMsg, storeAck],
};

const channel: ChannelConfig = {
  name: 'Example Channel Config',
  source: {
    kind: 'schedule',
    schedule: {
      msgType: 'HL7v2',
      schedule: '0 /15 * * * *',
      runner: {
        kind: 'file',
        file: {
          directory: '/tmp',
          filterOptions: {
            filenameRegex: '.*\\.hl7',
          }
        },
      }
    },
  },
  ingestion: [
    {
      kind: 'ack',
      ack: {
        organization: 'Example Org',
      }
    },
  ],
  routes: [route],
};

gofer.configs([channel]);
```
