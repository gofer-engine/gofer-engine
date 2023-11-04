import Msg from '@gofer-engine/hl7';
import fs from 'fs';
import stores from '..';
import { testContext } from '../types';

const hl7 = fs.readFileSync('./samples/sample.hl7', 'utf8');

const msg = new Msg(hl7);

test('file-store', async () => {
  const fileStore = new stores.file();
  if (fs.existsSync('./local/MSGID002.hl7')) fs.rmSync('./local/MSGID002.hl7');
  if (!fs.existsSync('./local')) fs.mkdirSync('./local');
  return fileStore.store(msg, testContext).then(() => {
    const storedFile = fs.readFileSync('./local/MSGID002.hl7', 'utf8');
    if (fs.existsSync('./local/MSGID002.hl7'))
      fs.rmSync('./local/MSGID002.hl7');
    expect(storedFile).toBe(hl7);
  });
});
