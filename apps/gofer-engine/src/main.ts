import gofer from '@gofer-engine/engine';

// HTTP Listener
gofer
  .listen('http', {
    host: '127.0.0.1',
    port: 8100,
    method: 'POST',
    basicAuth: {
      username: 'user',
      password: 'pass'
    }
  })
  .logLevel('debug')
  .ack({
    msg(ack, _msg, context) {
        console.log({ context })
        return ack;
    },
  })
  .route((r) => r.store({ file: {} }))
  .run();

// TCP (MLLP) Listener
gofer
  .listen('tcp', '127.0.0.1', 5600)
  .logLevel('debug')
  .ack()
  .store({ file: {} })
  .run();

// TCP (MLLP) Messenger
const [sendTcp, tcpMessengerId] = gofer.messenger((route) =>
  route.send('tcp', '127.0.0.1', 5600)
);

// HTTP Messenger
const [sendHttp, httpMessengerId] = gofer.messenger((route) =>
  route.send('http', {
    host: '127.0.0.1',
    port: 8100,
    method: 'POST',
    basicAuth: {
      username: 'user',
      password: 'pass'
    }
  }),
);

// Example Use of TCP Messenger
setTimeout(async () => {
  const sent = await sendTcp(
    `MSH|^~\\&|||||199912271408||ADT^A04|123|D|2.5\nEVN|A04|199912271408|||\nPID|1||1234||DOE^JOHN|||M`,
  );
  console.log(`Message sent to TCP Client ${tcpMessengerId}: ${sent}`);
}, 3000);

// Example Use of HTTP Messenger
setTimeout(async () => {
  const sent = await sendHttp(
    `MSH|^~\\&|||||199912271408||ADT^A04|123|D|2.5\nEVN|A04|199912271408|||\nPID|1||1234||DOE^JOHN|||M`,
  );
  console.log(`Message sent to HTTP Client ${httpMessengerId}: ${sent}`);
}, 3000);
