import { randomUUID } from 'crypto';
import cache from '@gofer-engine/cache';

const uuids = new cache({
  // FIXME: is there a better way to get to the cache lib dir using nx?
  base: `${__dirname}/../../cache/.cache`,
  name: 'uuids',
});
let uuidIndex = 0;
let idIndex = 0;
let uidIndex = 0;

export const genUUID = () => {
  uuidIndex++;
  let id: string | undefined = undefined;
  try {
    id = uuids.getSync(uuidIndex.toString());
  } catch (_e: unknown) {
    // ignore
  }
  if (id) return id;
  const newId = randomUUID();
  uuids.putSync(uuidIndex.toString(), newId);
  return newId;
};

/**
 * __*NOT PRODUCTION READY!*__
 * 
 * Generated a unique ID but consistent cacheable IDs for testing.
 * To make this work in production, IDs and UIDS last used must be
 * stored in a cache and retrieved on startup to continue the sequence.
 * 
 * UUIDs in production should be generated using randomUUID() from
 * the crypto module and not cached.
 */
export const genId = (type: 'UUID' | 'ID' | 'UID' = 'UUID') => {
  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('ERROR: genId() is not production ready!');
  }
  switch (type) {
    case 'UUID':
      return genUUID();
    case 'ID': {
      idIndex++;
      return idIndex.toString();
    }
    case 'UID': {
      uidIndex++;
      return uidIndex.toString(16);
    }
    default: {
      throw new Error(`Invalid ID type: ${type}`);
    }
  }
};
