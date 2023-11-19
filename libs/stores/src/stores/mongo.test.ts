import Msg, { StrictMessage } from '@gofer-engine/hl7';
import fs from 'fs';
import stores from '..';
import { exec } from '@gofer-engine/tools'
import { MongoClient, Document, ObjectId } from 'mongodb';
import { testContext } from '../types';

// this does a lazy check if the test is running inside the docker compose environment
const USE_DOCKER = process.env['container'] !== 'docker';

// const mongo = new MongoClient('mongodb://127.0.0.1:27017')
let mongo: MongoClient | undefined = undefined;

const hl7 = fs.readFileSync('./samples/sample.hl7', 'utf8');

const msg = new Msg(hl7);

interface DocAllowCustomId extends Document {
  _id?: string | ObjectId;
}

if (USE_DOCKER) beforeAll(async () => {
  await exec('sh ./libs/stores/src/stores/mongo.test.sh');
  mongo = new MongoClient('mongodb://127.0.0.1:27017');
});

const main = async () => {
  if (!mongo) {
    return fail('Mongo client was not initialized');
  }
  const client = await mongo.connect();
  const collection = client.db('test').collection<DocAllowCustomId>('test');
  const count = await collection.countDocuments();
  if (count > 0) {
    await collection.drop();
  }
  const db = new stores.mongo({ database: 'test', id: '$MSH-10.1' });
  return db.store(msg, testContext).then(async () => {
    const storedRecord = await collection.findOne({ _id: 'MSGID002' });
    const { meta = undefined, segments = undefined } =
      storedRecord === null ? {} : storedRecord;
    let msg = new Msg();
    if (meta && segments) {
      msg = new Msg({ meta, segments } as StrictMessage);
    } else {
      fail('The stored record was emtpy');
    }
    await collection.drop();
    if (mongo) await mongo.close();
    await db.close();
    expect(msg.toString()).toBe(hl7);
  });
};

const tester: jest.It = USE_DOCKER ? test : test.skip;

tester('mongo-store', main, 15000);

if (USE_DOCKER) afterAll(async () => {
  if (mongo) mongo.close();
  await exec('docker stop jest-mongodb');
});
