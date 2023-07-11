import { Message } from '../types';

export const getSegments = (msg: Message, segmentName: string | undefined) => {
  if (segmentName === undefined) return msg[1];
  if (segmentName.match(/^[A-Z0-9]{3}$/) === null)
    throw new Error(
      `Expected segment name to be 3 characters long, got ${segmentName}`
    );
  return msg[1].filter((s) => s[0] === segmentName);
};
