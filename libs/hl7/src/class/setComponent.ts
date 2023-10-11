import { deepCopy } from '../encode/deepCopy';
import { Message, Component } from '../types';
import {
  toFieldRep,
  toFieldStrict,
  toArray,
  toFieldLoose,
  toFieldOrRep,
} from './coerce';

export const setComponent = (
  msg: Message,
  segName: string,
  // NOTE: this does not respect segment groups, it will iterate over all segments with the same name.
  segmentIteration: number | undefined,
  fieldPosition: number,
  fieldIteration: number | undefined,
  componentPosition: number,
  value: string | Component | ((component: Component) => Component),
  decode = true,
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
                  let field = toFieldStrict(f);
                  if (field.length < componentPosition) {
                    field[componentPosition - 1] = [];
                  }
                  field = field.map((comp, i) => {
                    if (i === componentPosition - 1) {
                      return toArray(
                        typeof value === 'function'
                          ? value(comp)
                          : decode && typeof value === 'string'
                          ? value
                          : value,
                      );
                    }
                    return comp;
                  });
                  return toFieldLoose(field);
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
