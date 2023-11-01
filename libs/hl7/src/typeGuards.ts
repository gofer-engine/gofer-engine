import { isMsg } from '@gofer-engine/message-type';
import { HL7v2, Segment, Segments } from './types';

export const isSegmentArray = (
  segments: Segment | Segments,
): segments is Segments => Array.isArray(segments[0]);

export const msgIsHL7v2 = (msg: unknown): msg is HL7v2 => {
  if (!isMsg(msg)) return false;
  return msg.kind === 'HL7v2';
};
