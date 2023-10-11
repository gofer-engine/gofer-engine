import { randomUUID } from 'crypto';
import cache from './cache';

const uuids = new cache({
  base: `${__dirname}/../.cache`,
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

export const genId = (type: 'UUID' | 'ID' | 'UID' = 'UUID') => {
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
