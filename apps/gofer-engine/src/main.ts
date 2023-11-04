import gofer from '@gofer-engine/engine';
import { IJSONMsg } from "@gofer-engine/json";
import fs from 'fs';
import path from 'path';

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
    const { family: lastName, given: [firstName, middleName] } = msg.get('name').find(n => n.use === 'official');
    const id = msg.get('identifier').find(i => i.use === 'usual')?.value;
    msg.setMsg({
      id,
      name: {
        firstName,
        middleName,
        lastName,
        dateOfBirth: msg.get('birthdate'),
      },
      gender: msg.get('gender'),
    })
      .copy('name.firstName', 'firstName')
      .copy('name.lastName', 'lastName')
      .move('name.dateOfBirth', 'birthdate')
    return msg;
  })
  .route((r) => r.store({ file: {} }))
  .run();

// HTTP Messenger
const [sendHttpsJSON, httpsJSONMessengerId] = gofer.messenger<IJSONMsg>((route) =>
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

const PatientFhirExample = {
  resourceType: 'Patient',
  id: 'example',
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><p style="border: 1px #661aff solid; background-color: #e6e6ff; padding: 10px;"><b>Jim </b> male, DoB: 1974-12-25 ( Medical record number: 12345\u00a0(use:\u00a0USUAL,\u00a0period:\u00a02001-05-06 --&gt; (ongoing)))</p><hr/><table class="grid"><tr><td style="background-color: #f3f5da" title="Record is active">Active:</td><td>true</td><td style="background-color: #f3f5da" title="Known status of Patient">Deceased:</td><td colspan="3">false</td></tr><tr><td style="background-color: #f3f5da" title="Alternate names (see the one above)">Alt Names:</td><td colspan="3"><ul><li>Peter James Chalmers (OFFICIAL)</li><li>Peter James Windsor (MAIDEN)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Ways to contact the Patient">Contact Details:</td><td colspan="3"><ul><li>-unknown-(HOME)</li><li>ph: (03) 5555 6473(WORK)</li><li>ph: (03) 3410 5613(MOBILE)</li><li>ph: (03) 5555 8834(OLD)</li><li>534 Erewhon St PeasantVille, Rainbow, Vic  3999(HOME)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Nominated Contact: Next-of-Kin">Next-of-Kin:</td><td colspan="3"><ul><li>Bénédicte du Marché  (female)</li><li>534 Erewhon St PleasantVille Vic 3999 (HOME)</li><li><a href="tel:+33(237)998327">+33 (237) 998327</a></li><li>Valid Period: 2012 --&gt; (ongoing)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Patient Links">Links:</td><td colspan="3"><ul><li>Managing Organization: <a href="organization-example-gastro.html">Organization/1</a> &quot;Gastroenterology&quot;</li></ul></td></tr></table></div>',
  },
  identifier: [
    {
      use: 'usual',
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
          },
        ],
      },
      system: 'urn:oid:1.2.36.146.595.217.0.1',
      value: '12345',
      period: {
        start: '2001-05-06',
      },
      assigner: {
        display: 'Acme Healthcare',
      },
    },
  ],
  active: true,
  name: [
    {
      use: 'official',
      family: 'Chalmers',
      given: ['Peter', 'James'],
    },
    {
      use: 'usual',
      given: ['Jim'],
    },
    {
      use: 'maiden',
      family: 'Windsor',
      given: ['Peter', 'James'],
      period: {
        end: '2002',
      },
    },
  ],
  telecom: [
    {
      use: 'home',
    },
    {
      system: 'phone',
      value: '(03) 5555 6473',
      use: 'work',
      rank: 1,
    },
    {
      system: 'phone',
      value: '(03) 3410 5613',
      use: 'mobile',
      rank: 2,
    },
    {
      system: 'phone',
      value: '(03) 5555 8834',
      use: 'old',
      period: {
        end: '2014',
      },
    },
  ],
  gender: 'male',
  birthDate: '1974-12-25',
  _birthDate: {
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/patient-birthTime',
        valueDateTime: '1974-12-25T14:35:45-05:00',
      },
    ],
  },
  deceasedBoolean: false,
  address: [
    {
      use: 'home',
      type: 'both',
      text: '534 Erewhon St PeasantVille, Rainbow, Vic  3999',
      line: ['534 Erewhon St'],
      city: 'PleasantVille',
      district: 'Rainbow',
      state: 'Vic',
      postalCode: '3999',
      period: {
        start: '1974-12-25',
      },
    },
  ],
  contact: [
    {
      relationship: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
              code: 'N',
            },
          ],
        },
      ],
      name: {
        family: 'du Marché',
        _family: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/humanname-own-prefix',
              valueString: 'VV',
            },
          ],
        },
        given: ['Bénédicte'],
      },
      telecom: [
        {
          system: 'phone',
          value: '+33 (237) 998327',
        },
      ],
      address: {
        use: 'home',
        type: 'both',
        line: ['534 Erewhon St'],
        city: 'PleasantVille',
        district: 'Rainbow',
        state: 'Vic',
        postalCode: '3999',
        period: {
          start: '1974-12-25',
        },
      },
      gender: 'female',
      period: {
        start: '2012',
      },
    },
  ],
  managingOrganization: {
    reference: 'Organization/1',
  },
};

// Example Use of HTTPS Messenger
setTimeout(async () => {
  const sent = await sendHttpsJSON(PatientFhirExample);
  console.log(
    `Message sent to HTTP JSON Client ${httpsJSONMessengerId}: ${sent}`,
  );
}, 3000);
