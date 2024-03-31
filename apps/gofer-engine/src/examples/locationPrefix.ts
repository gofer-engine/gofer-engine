import gofer, { ChannelConfig, TransformFunc } from '@gofer-engine/engine';

// highlight-start
const transform: TransformFunc = (msg) =>
  msg.map('PV1-3[1].1', <T>(location: T) => `HOSP.${location}` as T);
// highlight-end

// OOP style
gofer.listen('tcp', 'localhost', 5515)
  .name('Hosp Location Channel with OOP')
  // highlight-next-line
  .transform(transform)
  .ack()

// Config style
const channelConfig: ChannelConfig = {
  name: 'Hosp Location Channel with Configs',
  source: {
    kind: 'tcp',
    tcp: {
      host: 'localhost',
      port: 5516,
    },
  },
  // highlight-start
  ingestion: [{
    kind: 'transform',
    transform,
  }],
  // highlight-end
};

gofer.configs([channelConfig]);
