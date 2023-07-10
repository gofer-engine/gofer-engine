import { FuncDecodeHL7, MessageMeta, Segments } from '../types';
import { decodeSegment } from './decodeSegment';
import { getEncodingChars } from './getEncodingChars';

export const decodeHL7: FuncDecodeHL7 = (HL7, encoding = undefined) => {
  if (HL7.length === 0) {
    return undefined;
  }
  const encodingCharacters: MessageMeta['encodingCharacters'] =
    encoding !== undefined
      ? encoding
      : HL7.startsWith('MSH')
      ? getEncodingChars(HL7)
      : {
          componentSep: '^',
          escapeChar: '\\',
          fieldSep: '|',
          repetitionSep: '~',
          subComponentSep: '&',
          truncateChar: undefined,
        };
  const meta: MessageMeta = {
    encodingCharacters,
    encodedAt: new Date(),
  };
  const segments: Segments = HL7.split(/\r?\n|\r/)
    .filter((s) => s.length)
    .map((segment) => decodeSegment(segment, meta));
  return [meta, segments];
};
