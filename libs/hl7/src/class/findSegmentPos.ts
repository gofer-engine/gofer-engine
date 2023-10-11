import { Message, Paths } from '../types';
import { paths } from './paths';

export const findSegmentInMsg = (msg: Message, after: string): number => {
  const pathway = after.split(':').map((path) => paths(path));
  let segmentNames = msg[1].map((seg) => seg[0]);
  if (pathway.length) {
    let i = -1;
    const segmentPathNames: string[] = [];
    pathway.some((path, n) => {
      const { segmentName } = path;
      const index = findSegmentPos(segmentNames, path, segmentPathNames);
      if (segmentName) segmentPathNames.push(segmentName);
      if (index > -1) {
        // if (i === -1) i = 0
        i = i + index + 1;
        segmentNames = segmentNames.slice(index + 1);
      }
      if (index === -1) {
        if (n !== pathway.length - 1) {
          i = -1;
        }
        return true;
      }
      return false;
    });
    return i;
  } else {
    // return the last segment index when not found
    return -1;
  }
};

export const findSegmentPos = (
  segments: string[],
  paths: Paths,
  notIn?: string[],
) => {
  const { segmentName, segmentIteration } = paths;
  let index = -1; // return the last segment index when not found
  let iteration = 1;
  if (segmentName !== undefined) {
    if (
      !segments.some((seg, i) => {
        if (seg === segmentName) {
          if (segmentIteration === undefined) {
            index = i;
            return true;
          } else if (segmentIteration === iteration) {
            index = i;
            return true;
          }
          iteration++;
        } else if (notIn !== undefined && notIn.length && notIn.includes(seg)) {
          throw new Error(
            `Could not find ${segmentName}[${
              segmentIteration ?? 1
            }] with stop keys ${JSON.stringify(
              segments,
            )} but not in ${JSON.stringify(notIn)}`,
          );
        }
        return false;
      })
    ) {
      index = -1;
    }
  }
  return index;
};
