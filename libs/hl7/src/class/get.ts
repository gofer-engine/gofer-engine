import { Component, Field, FieldOrRep, FieldRep, ISeg } from '../types';
import HL7v2Msg from './Message';

export const get = (
  msg: HL7v2Msg,
  segmentName: string | undefined,
  segmentIteration?: number | undefined,
  fieldPosition?: number | undefined,
  fieldIteration?: number | undefined,
  componentPosition?: number | undefined,
  subComponentPosition?: number | undefined,
):
  | string
  | ISeg
  | { rep: true }
  | (string | ISeg | FieldRep | { rep: true } | Field[] | null | undefined)[]
  | null
  | undefined => {
  const segments = msg.getSegments(segmentName);
  if (segments.length === 0) return undefined;
  const selectedSegmentIterations = segments.filter((_, i) => {
    if (segmentIteration === undefined) return true;
    return i === segmentIteration - 1;
  }); // Seg[]
  if (selectedSegmentIterations.length === 0) return undefined;
  const ret = selectedSegmentIterations
    .map<ISeg | FieldOrRep>((seg) => {
      if (fieldPosition === undefined) return seg; // Seg
      return seg.json()?.[fieldPosition] as FieldOrRep; // FieldOrRep
    }) // Seg | FieldOrRep
    .map((field) => {
      if (
        Array.isArray(field) &&
        field.length > 1 &&
        typeof field[0] === 'object' &&
        field[0] !== null &&
        Object.prototype.hasOwnProperty.call(field[0], 'rep')
      ) {
        // is a repeating field...
        let f: Component[] | Field[] = [];
        if (fieldIteration === undefined) {
          f = [...field] as Component[] | Field[];
          f.shift();
        } else if (Array.isArray(field) && fieldIteration > 0) {
          f = (field as unknown[]).filter((f, i) => {
            if (fieldIteration === undefined) return true;
            return i === fieldIteration;
          }) as Component[] | Field[];
        }
        if (componentPosition !== undefined && componentPosition > 0) {
          f = f
            .map((comp) => comp?.[componentPosition - 1])
            .map((comp) => {
              if (
                !Array.isArray(comp) ||
                subComponentPosition === undefined ||
                subComponentPosition < 1
              )
                return comp;
              return comp?.[subComponentPosition - 1];
            });
        }
        if (Array.isArray(f) && f.length === 1) {
          return f[0];
        }
        return f;
      } else if (fieldIteration !== undefined && fieldIteration !== 1) {
        // non iterable field with a invalid field iteration index as 1 or undefined are the only valid indexes of a non iterable field
        return undefined;
      }
      if (Array.isArray(field)) {
        if (componentPosition === undefined || componentPosition < 1)
          return field;
        const comp = field?.[componentPosition - 1];
        if (
          !Array.isArray(comp) ||
          subComponentPosition === undefined ||
          subComponentPosition < 1
        )
          return comp;
        return comp?.[subComponentPosition - 1];
      }
      return field; // Seg | FieldOrRep
    });
  if (ret.length === 1) return ret[0];
  return ret;
};
