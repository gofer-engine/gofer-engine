import { Field, FieldRep, Message, Segment, Segments } from '../types';

export type IMsgFieldList = Record<
  string,
  // if true then keep/delete segment as a whole
  | true
  // if number then keep/delete all repeating segments of type. Keeps <= n; Deletes >= n.
  // NOTE: This does respect segment groupings
  // FIXME: Make this optionally respect segment groupings somehow???
  | number
  // if function returns true then keep/delete segment as a whole
  | ((seg: Segment) => boolean)
  // if undefined then do nothing
  | undefined
  // process the fields of the segment:
  | Record<
      // field key. Remember that fields are 1-indexed.
      number,
      // if true then keep/delete field as a whole
      | true
      // if number then keep/delete all repeating fields at key's position. Keeps <= n; Deletes >= n.
      | number
      // if number array then keep/delete specific components by key of field at key's position. Remember that components are 1-indexed.
      | number[]
      // if function returns true then keep/delete field at key's position.
      // NOTE: This field is currently 0-indexed if it is a component or sub-component
      // FIXME: Change this to be 1-indexed for both component and sub-component (2 dimensional arrays)
      | ((field: Field, iteration: number) => boolean)
      // if undefined then do nothing to field at key's position
      | undefined
    >
>;

export interface IMsgLimiter {
  restrict?: IMsgFieldList;
  remove?: IMsgFieldList;
}

export const transform = (
  [meta, segs]: Message,
  { restrict, remove }: IMsgLimiter = { restrict: {}, remove: {} },
): Message => {
  let lastSeenSegment: undefined | string = undefined;
  let segmentIteration = 0;
  const processedSegs = segs
    .filter((seg) => {
      const segName = seg[0];
      // console.log({ segName })
      const restrictSeg = restrict?.[segName];
      const removeSeg = remove?.[segName];
      // if restrict not undefined and segName not in restrict then delete segment
      if (restrict !== undefined && restrictSeg === undefined) return false;
      // if removeSeg === true then delete segment
      if (removeSeg === true) return false;
      // if removeSeg === function then delete segment if function returns true
      if (typeof removeSeg === 'function' && removeSeg(seg)) return false;
      // if restrictSeg === function then delete segment if function returns false
      if (typeof restrictSeg === 'function' && !restrictSeg(seg)) return false;
      // set segment iteration attribute
      if (lastSeenSegment === segName) {
        segmentIteration++;
      } else {
        lastSeenSegment = segName;
        segmentIteration = 1;
      }
      // if restrictSeg === number then delete segment if iteration > number
      if (typeof restrictSeg === 'number' && segmentIteration > restrictSeg)
        return false;
      // if removeSeg === number then delete segment if iteration >= number
      if (typeof removeSeg === 'number' && segmentIteration >= removeSeg)
        return false;
      // else keep segment
      return true;
    })
    .map((seg) => {
      const [segName, ...fields] = seg;
      const restrictSeg = restrict?.[segName];
      const removeSeg = remove?.[segName];
      // if removeSeg === true then we should not be here
      if (removeSeg === true) throw new Error('This should not be possible');

      const mappedFields = fields.map((field, i) => {
        const restrictField =
          // if restrictSeg === true then ignore the restrictSeg
          restrictSeg === true ||
          // if restrictSeg === number then ignore the restrictSeg
          typeof restrictSeg === 'number' ||
          // if restrictSeg === function then ignore the restrictSeg
          typeof restrictSeg === 'function'
            ? undefined
            : restrictSeg?.[i + 1];
        const removeField =
          // if removeSeg === number then ignore the removeSeg
          typeof removeSeg === 'number' ||
          // if removeSeg === function then ignore the removeSeg
          typeof removeSeg === 'function'
            ? undefined
            : removeSeg?.[i + 1];
        // if removeField === true then delete the field by returning null
        if (removeField === true) return null;
        // if removeField === function then delete the field by returning null if function returns true

        // FIXME:
        // if (typeof removeField === 'function' && !removeField(field)) return null

        // if restrictSeg is object (not a function), but this restrictField is undefined, then delete the field by returning null
        if (
          typeof restrictSeg == 'object' &&
          typeof restrictSeg !== 'function' &&
          restrictField === undefined
        )
          return null;

        // coerce field into fieldRep
        let [, ...fields]: FieldRep =
          Array.isArray(field) &&
          typeof field[0] === 'object' &&
          field[0] !== null &&
          !Array.isArray(field[0]) &&
          field[0].rep === true
            ? (field as FieldRep)
            : [{ rep: true }, field as Field];

        fields = fields
          .filter((field, i) => {
            if (restrictField === true) return true;
            if (typeof restrictField === 'function')
              return restrictField(field, i + 1);
            if (typeof removeField === 'function')
              return !removeField(field, i + 1);
            if (typeof restrictField === 'number' && i >= restrictField) {
              return false;
            }
            if (typeof removeField === 'number' && i + 1 >= removeField) {
              return false;
            }
            return true;
          })
          .map((field) => {
            if (Array.isArray(restrictField)) {
              if (!Array.isArray(field)) {
                if (restrictField.includes(1)) return field;
                return null;
              }
              field = field.map((component, i) => {
                if (restrictField.includes(i + 1)) return component;
                return null;
              });
              while (field.length > 0 && field[field.length - 1] === null) {
                field.pop();
              }
            }
            return field;
          })
          .map((field) => {
            if (Array.isArray(removeField)) {
              if (!Array.isArray(field)) {
                if (removeField.includes(1)) return null;
                return field;
              }
              field = field.map((component, i) => {
                if (removeField.includes(i + 1)) return null;
                return component;
              });
              while (field.length > 0 && field[field.length - 1] === null) {
                field.pop();
              }
            }
            return field;
          });

        if (fields.length > 1) return [{ rep: true }, ...fields] as FieldRep;
        return fields[0] as Field;
      });

      // else just keep the segment as it was
      return [segName, ...mappedFields];
    }) as Segments;
  return [meta, processedSegs];
};
