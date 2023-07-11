import { IMsg, Segment, Segments } from './types';

export const isSegmentArray = (
  segments: Segment | Segments
): segments is Segments => Array.isArray(segments[0]);

export const isMsg = (msg: unknown): msg is IMsg => {
  if (typeof msg !== 'object') return false;
  if (msg === null) return false;
  if (Array.isArray(msg)) return false;
  return (
    [
      'setMsg',
      'json',
      'addSegment',
      'toString',
      'set',
      'setJSON',
      'get',
      'getSegments',
      'getSegment',
      'id',
      'transform',
      'delete',
      'copy',
      'move',
      'map',
      'setIteration',
    ] as (keyof IMsg)[]
  ).every(
    (method) => method in msg && typeof (msg as any)[method] === 'function'
  );
};
