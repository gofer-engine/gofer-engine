import decode from '../decode';
import { isSegmentArray } from '../typeGuards';
import { ISeg, ISegs, Message, Segment, Segments } from '../types';
import { Seg, Segs } from './Segment';
import { findSegmentInMsg } from './findSegmentPos';

export const addSegment = (
  segment: string | Segment | Segments | ISeg | ISegs,
  msg: Message,
  after?: number | string,
): Message | false => {
  const segments: Segment[] = [];
  if (segment instanceof Seg) {
    segments.push(segment.json());
  } else if (segment instanceof Segs) {
    segments.push(...segment.json());
  } else if (typeof segment === 'string') {
    const seg = decode(segment);
    if (seg === undefined) {
      return false;
    }
    segments.push(...seg[1]);
  } else if (Array.isArray(segment) && segment.length > 0) {
    if (isSegmentArray(segment)) {
      segments.push(...segment);
    } else {
      segments.push(segment);
    }
  }
  if (segments.length > 0) {
    if (typeof after === 'string') {
      const index = findSegmentInMsg(msg, after);
      after = index + 1;
    }
    if (after === undefined) {
      msg[1].push(...segments);
    } else if (typeof after === 'number') {
      msg[1].splice(after, 0, ...segments);
    }
    return msg;
  } else {
    return false;
  }
};
