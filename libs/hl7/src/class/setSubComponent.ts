import { deepCopy } from '../encode/deepCopy';
import { Message, SubComponent } from '../types';
import {
  toFieldLoose,
  toFieldOrRep,
  toFieldRep,
  toFieldStrict,
} from './coerce';
import { escapeSubComp } from './escapeString';

export const setSubComponent = (
  msg: Message,
  segName: string,
  // NOTE: this does not respect segment groups, it will iterate over all segments with the same name.
  segmentIteration: number | undefined,
  fieldPosition: number,
  fieldIteration: number | undefined,
  componentPosition: number,
  subComponentPosition: number,
  value: SubComponent | ((subComponent: SubComponent) => SubComponent),
  escape = true
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
                      if (comp.length < subComponentPosition) {
                        comp[subComponentPosition - 1] = null;
                      }
                      return comp.map((sub, i) => {
                        if (i === subComponentPosition - 1)
                          return typeof value === 'function'
                            ? value(sub)
                            : escape
                            ? escapeSubComp(value, msg[0])
                            : value;
                        return sub;
                      });
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
