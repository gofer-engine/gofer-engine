import { decodeSegment } from '../decode/decodeSegment';
import { deepCopy } from '../encode/deepCopy';
import { Message, Segment } from '../types';

export const setSegment = (
  msg: Message,
  segName: string,
  // NOTE: this does not respect segment groups, it will iterate over all segments with the same name.
  segmentIteration: number | undefined,
  value: Segment | ((segment: Segment) => Segment) | string,
  decode = true
): Message => {
  // eslint-disable-next-line prefer-const
  let [meta, ...segments] = deepCopy(msg);
  segments = segments.map((segmentGroups) => {
    let segIndex = 0;
    return segmentGroups.map((segment) => {
      // eslint-disable-next-line prefer-const
      let [name] = segment;
      if (name === segName) {
        segIndex++;
        if (segIndex === segmentIteration || segmentIteration === undefined) {
          if (typeof value === 'string') {
            if (decode) {
              return decodeSegment(value, msg[0]);
            }
            throw new Error('Value is a string, but decode was disabled.');
          }
          return typeof value === 'function' ? value(segment) : value;
        }
      }
      return segment;
    });
  });

  msg = [meta, ...segments];
  return msg;
};
