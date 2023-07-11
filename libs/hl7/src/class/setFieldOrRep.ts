import { deepCopy } from '../encode/deepCopy';
import { Message, FieldOrRep } from '../types';

export const setFieldOrRep = (
  msg: Message,
  segName: string,
  // NOTE: this does not respect segment groups, it will iterate over all segments with the same name.
  segmentIteration: number | undefined,
  fieldPosition: number,
  value: FieldOrRep | ((fieldRep: FieldOrRep) => FieldOrRep)
): Message => {
  // eslint-disable-next-line prefer-const
  let [meta, ...segments] = deepCopy(msg);
  segments = segments.map((segmentGroups) => {
    let segIndex = 0;
    return segmentGroups.map((segment) => {
      // eslint-disable-next-line prefer-const
      let [name, ...fields] = segment;
      if (name === segName) {
        segIndex++;
        if (segIndex === segmentIteration || segmentIteration === undefined) {
          if (fields.length < fieldPosition) {
            fields[fieldPosition - 1] = null;
          }
          fields = fields.map((field, i) => {
            if (i === fieldPosition - 1) {
              return typeof value === 'function' ? value(field) : value;
            }
            return field;
          });
          return [name, ...fields];
        }
      }
      return segment;
    });
  });

  msg = [meta, ...segments];
  return msg;
};
