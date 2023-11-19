import { exec } from '@gofer-engine/tools'
import Msg from '@gofer-engine/hl7';
import fs from 'fs';

import stores from '..';
import { testContext } from '../types';

// this does a lazy check if the test is running inside the docker compose environment
const USE_DOCKER = process.env['container'] !== 'docker';

const hl7 = fs.readFileSync('./samples/sample.hl7', 'utf8');
const msg = new Msg(hl7);

const query = `SELECT id, guid, data FROM public."test" WHERE guid='MSGID002'`

if (USE_DOCKER) beforeAll(async () => {
  await exec('sh ./libs/stores/src/stores/postgres.test.sh');
});

if (USE_DOCKER) afterAll(async () => {
  await exec('docker stop jest-postgres')
});

const tester: jest.It = USE_DOCKER ? test : test.skip;

tester('postgres-store', async () => {
  const db = new stores.postgres({
    password: 'password',
    id: '$MSH-10.1',
  });
  await db.query(`DROP TABLE IF EXISTS public."test";`)
  const stored = await db.store(msg, testContext);
  expect(stored).toBe(true);
  const storedRecord = await db.query(query);
  expect(storedRecord.rows?.length).toBe(1);
  expect(storedRecord.rows?.[0]?.guid).toBe('MSGID002');
  const actual = JSON.stringify(storedRecord.rows?.[0]?.data);
  const expected = JSON.stringify({ meta: msg.json()[0], msg: msg.json()[1] });
  db.close();
  expect(actual).toBe(expected);
}, 60000);
