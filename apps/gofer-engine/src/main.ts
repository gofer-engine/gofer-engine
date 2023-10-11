import gofer from '@gofer-engine/engine';

gofer
  .listen('tcp', '127.0.0.1', 5600)
  .logLevel('debug')
  .ack()
  .store({ file: {} })
  .run();

const [send, messengerId] = gofer.messenger((route) =>
  route.send('tcp', '127.0.0.1', 5600),
);

setTimeout(async () => {
  const sent = await send(
    `MSH|^~\\&|||||199912271408||ADT^A04|123|D|2.5\nEVN|A04|199912271408|||\nPID|1||1234||DOE^JOHN|||M`,
  );
  console.log(`Message sent to ${messengerId}: ${sent}`);
}, 10000);
