import { deepCopy } from '../encode/deepCopy';
import { Message, Field } from '../types';
import { toFieldRep, toFieldOrRep } from './coerce';

export const setField = (
  msg: Message,
  segName: string,
  // NOTE: this does not respect segment groups, it will iterate over all segments with the same name.
  segmentIteration: number | undefined,
  fieldPosition: number,
  fieldIteration: number | undefined,
  value: Field | ((field: Field) => Field),
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
              let [, ...fields] = toFieldRep(field);
              if (
                fieldIteration !== undefined &&
                fields.length < fieldIteration
              ) {
                fields[fieldIteration - 1] = null;
              }
              fields = fields.map((f, i) => {
                if (fieldIteration === undefined || i === fieldIteration - 1) {
                  return typeof value === 'function' ? value(f) : value;
                }
                return f;
              });
              return toFieldOrRep([{ rep: true }, ...fields]);
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
