import { deepCopy } from '../encode/deepCopy';
import { Message } from '../types';

export const deleteSegment = (
  msg: Message,
  segName: string,
  // NOTE: this does not respect segment groups, it will iterate over all segments with the same name.
  segmentIteration: number | undefined,
): Message => {
  // eslint-disable-next-line prefer-const
  let [meta, ...segments] = deepCopy(msg);
  segments = segments.map((segmentGroups) => {
    let segIndex = 0;
    return segmentGroups.filter((segment) => {
      // eslint-disable-next-line prefer-const
      let [name] = segment;
      if (name === segName) {
        segIndex++;
        if (segIndex === segmentIteration || segmentIteration === undefined) {
          return false;
        }
      }
      return true;
    });
  });

  msg = [meta, ...segments];
  return msg;
};
