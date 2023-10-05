import { Message } from '../types';
import { deepCopy } from './deepCopy';
import { encodeRep } from './encodeRep';
import { encodeSep } from './encodeSep';

type FuncEncodeHL7 = (message: Message) => string;
export const encodeHL7: FuncEncodeHL7 = (message) => {
  message = deepCopy(message);
  const { fieldSep, repetitionSep, componentSep, subComponentSep } =
    message[0].encodingCharacters;
  const segments = message[1];
  const hl7 = encodeSep(segments, '\r', (seg) => {
    if (Array.isArray(seg)) {
      if (seg[0] === 'MSH') {
        const name = seg[0];
        const fieldSep = seg?.[1] || '|';
        const encodingChars = seg[2] || '^~\\&';
        seg.splice(0, 3, `${name}${fieldSep}${encodingChars}`);
      }
    }
    return encodeSep(seg, fieldSep, (field) => {
      return encodeRep(field, repetitionSep, (rep) => {
        return encodeSep(rep, componentSep, (comp) => {
          return encodeSep(comp, subComponentSep);
        });
      });
    });
  });
  return hl7 as string;
};
