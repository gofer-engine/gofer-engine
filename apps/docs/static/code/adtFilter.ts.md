```ts title="/src/adtFilter.ts"
import gofer, { ChannelConfig, FilterFunc } from '@gofer-engine/engine';

// highlight-start
const filter: FilterFunc = (msg, { kind }) => {
  if (kind !== 'HL7v2') return false;
  return msg.get('MSH-9.1') === 'ADT'
}
// highlight-end

// OOP style
gofer.listen('tcp', 'localhost', 5510)
  .name('ADT Channel with OOP')
  // highlight-next-line
  .filter(filter)
  .ack()

// Config style
const channelConfig: ChannelConfig = {
  name: 'ADT Channel with Configs',
  source: {
    kind: 'tcp',
    tcp: {
      host: 'localhost',
      port: 5511,
    },
  },
  // highlight-start
  ingestion: [{
    kind: 'filter',
    filter,
  }],
  // highlight-end
};

gofer.configs([channelConfig]);
```
