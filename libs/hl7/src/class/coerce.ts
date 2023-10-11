import { deepCopy } from '../encode/deepCopy';
import { Field, FieldOrRep, FieldRep, SubComponent } from '../types';
import { isFieldRep } from './isFieldRep';

export const toArray = <T>(data: T | T[]): T[] => {
  if (Array.isArray(data)) return data;
  return [data];
};

export const toFieldRep = (field: FieldOrRep): FieldRep => {
  if (isFieldRep(field)) return field as FieldRep;
  return [{ rep: true }, field as Field];
};

export const toFieldStrict = (field: Field): SubComponent[][] => {
  const f = deepCopy(field);
  if (!Array.isArray(f)) return [[f]];
  return f.map((component) => {
    if (!Array.isArray(component)) return [component];
    return component;
  });
};

export const toFieldLoose = (
  field: SubComponent[][],
  trimEmpty = false,
): Field => {
  let foundNonNull = false;
  const f = deepCopy(field);
  const retField: Field = f
    .reverse()
    .map((component) => {
      let foundNonNull = false;
      return component
        .reverse()
        .filter((sub) => {
          if (trimEmpty) {
            if (!foundNonNull) {
              if (sub === null || sub === undefined) return false;
              foundNonNull = true;
            }
          }
          return true;
        })
        .reverse();
    })
    .map((comp) => {
      if (comp.length === 0) return null;
      if (comp.length === 1) return comp[0];
      return comp;
    })
    .filter((comp) => {
      if (trimEmpty) {
        if (!foundNonNull) {
          if (comp === null || comp === undefined) return false;
          foundNonNull = true;
        }
      }
      return true;
    })
    .reverse();
  if (retField.length === 0) return null;
  if (retField.length === 1 && !Array.isArray(retField[0])) return retField[0];
  return retField;
};

export const toFieldOrRep = (
  field: FieldRep,
  trimEmpty = false,
): FieldOrRep => {
  const f = deepCopy(field);
  if (f.length < 2) return null;
  let [, ...fields] = f;
  let foundNonNull = false;
  fields = fields
    .reverse()
    .filter((f) => {
      if (trimEmpty && !foundNonNull) {
        if (f === null || f === undefined) return false;
        foundNonNull = true;
      }
      return true;
    })
    .reverse();
  if (trimEmpty && fields.length === 0) return null;
  if (fields.length > 1) return [{ rep: true }, ...fields];
  return fields?.[0];
};
