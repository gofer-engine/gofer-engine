import gofer from '@gofer-engine/engine';
import { IJSONMsg } from '@gofer-engine/json';
import fs from 'fs';
import path from 'path';

const PatientFhirExample = JSON.parse(fs.readFileSync(
  path.join(
    process.env.NX_WORKSPACE_ROOT,
    'samples',
    'samplePatient.fhir.json',
  ),
  'utf8'
));

/********************************************************
 * Examples of using TCP (MLLP) Listener and Messenger  *
 *******************************************************/
// TCP (MLLP) Listener
gofer
  .listen('tcp', '127.0.0.1', 5600)
  .logLevel('debug')
  .ack()
  .store({ file: {} })
  .run();

// // TCP (MLLP) Messenger
const [sendTcp, tcpMessengerId] = gofer.messenger((route) =>
  route.send('tcp', '127.0.0.1', 5600),
);

// Example Use of TCP Messenger
setTimeout(async () => {
  const sent = await sendTcp(
    `MSH|^~\\&|||||199912271408||ADT^A04|123|D|2.5\nEVN|A04|199912271408|||\nPID|1||1234||DOE^JOHN|||M`,
  );
  console.log(`Message sent to TCP Client ${tcpMessengerId}: ${sent}`);
}, 3000);

/**************************************************
 * Examples of using HTTP Listener and Messenger  *
 *************************************************/
// HTTP Listener
gofer
  .listen('http', {
    host: '127.0.0.1',
    port: 8100,
    method: 'POST',
    basicAuth: {
      username: 'user',
      password: 'pass',
    },
  })
  .logLevel('debug')
  .ack()
  .route((r) => r.store({ file: {} }))
  .run();

// HTTP Messenger
const [sendHttp, httpMessengerId] = gofer.messenger((route) =>
  route.send('http', {
    host: '127.0.0.1',
    port: 8100,
    method: 'POST',
    basicAuth: {
      username: 'user',
      password: 'pass',
    },
  }),
);

// Example Use of HTTP Messenger
setTimeout(async () => {
  const sent = await sendHttp(
    `MSH|^~\\&|||||199912271408||ADT^A04|123|D|2.5\nEVN|A04|199912271408|||\nPID|1||1234||DOE^JOHN|||M`,
  );
  console.log(`Message sent to HTTP Client ${httpMessengerId}: ${sent}`);
}, 3000);

/**************************************************
 * Examples of using HTTPS Listener and Messenger  *
 *************************************************/
// HTTPS Listener
gofer
  .listen('https', {
    host: '127.0.0.1',
    port: 8101,
    method: 'POST',
    basicAuth: {
      username: 'user',
      password: 'pass',
    },
    key: fs.readFileSync(
      path.join(process.env.NX_WORKSPACE_ROOT, 'certs', 'key.pem'),
    ),
    cert: fs.readFileSync(
      path.join(process.env.NX_WORKSPACE_ROOT, 'certs', 'cert.pem'),
    ),
  })
  .logLevel('debug')
  .ack()
  .route((r) => r.store({ file: {} }))
  .run();

// HTTP Messenger
const [sendHttps, httpsMessengerId] = gofer.messenger((route) =>
  route.send('https', {
    host: '127.0.0.1',
    port: 8101,
    method: 'POST',
    basicAuth: {
      username: 'user',
      password: 'pass',
    },
    // accept self-signed certs
    rejectUnauthorized: false,
  }),
);

// Example Use of HTTPS Messenger
setTimeout(async () => {
  const sent = await sendHttps(
    `MSH|^~\\&|||||199912271408||ADT^A04|123|D|2.5\nEVN|A04|199912271408|||\nPID|1||1234||DOE^JOHN|||M`,
  );
  console.log(`Message sent to HTTP Client ${httpsMessengerId}: ${sent}`);
}, 3000);

/************************************************************
 * Examples of using HTTPS Listener and Messenger for JSON  *
 ***********************************************************/
// HTTPS Listener
gofer
  .listen('https', {
    msgType: 'JSON',
    host: '127.0.0.1',
    port: 8102,
    method: 'POST',
    basicAuth: {
      username: 'user',
      password: 'pass',
    },
    key: fs.readFileSync(
      path.join(process.env.NX_WORKSPACE_ROOT, 'certs', 'key.pem'),
    ),
    cert: fs.readFileSync(
      path.join(process.env.NX_WORKSPACE_ROOT, 'certs', 'cert.pem'),
    ),
  })
  .logLevel('debug')
  .ack()
  // .filter(msg => msg.get('resourceType') !== 'Patient')
  .transform((msg) => {
    const {
      family: lastName,
      given: [firstName, middleName],
    } = msg.get('name').find((n) => n.use === 'official');
    const id = msg.get('identifier').find((i) => i.use === 'usual')?.value;
    msg
      .setMsg({
        id,
        name: {
          firstName,
          middleName,
          lastName,
          dateOfBirth: msg.get('birthDate'),
        },
        gender: msg.get('gender'),
      })
      .copy('name.firstName', 'firstName')
      .copy('name.lastName', 'lastName')
      .move('name.dateOfBirth', 'birthdate');
    return msg;
  })
  .route((r) => r.store({ file: {} }))
  .run();

// HTTP Messenger
const [sendHttpsJSON, httpsJSONMessengerId] = gofer.messenger<IJSONMsg>(
  (route) =>
    route.send('https', {
      msgType: 'JSON',
      host: '127.0.0.1',
      port: 8102,
      method: 'POST',
      basicAuth: {
        username: 'user',
        password: 'pass',
      },
      // accept self-signed certs
      rejectUnauthorized: false,
    }),
);

// Example Use of HTTPS Messenger
setTimeout(async () => {
  const sent = await sendHttpsJSON(PatientFhirExample);
  console.log(
    `Message sent to HTTP JSON Client ${httpsJSONMessengerId}: ${sent}`,
  );
}, 3000);
