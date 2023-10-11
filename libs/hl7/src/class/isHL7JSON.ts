import { FieldRep, Message, Segment } from '../types';

export const isMessage = (msg: unknown): boolean => {
  if (
    Array.isArray(msg) &&
    typeof msg?.[0] === 'object' &&
    msg[0] !== null &&
    Object.keys(msg[0]).every((k) =>
      [
        'version',
        'messageCode',
        'triggerEvent',
        'messageStructure',
        'encodedAt',
        'encodingCharacters',
        'id',
      ].includes(k),
    ) &&
    Object.prototype.hasOwnProperty.call(msg[0], 'encodingCharacters') &&
    typeof msg[0].encodingCharacters === 'object' &&
    typeof msg[0].encodingCharacters?.fieldSep === 'string' &&
    msg[0].encodingCharacters.fieldSep.length === 1 &&
    typeof msg[0].encodingCharacters?.componentSep === 'string' &&
    msg[0].encodingCharacters.componentSep.length === 1 &&
    typeof msg[0].encodingCharacters?.subComponentSep === 'string' &&
    msg[0].encodingCharacters.subComponentSep.length === 1 &&
    typeof msg[0].encodingCharacters?.repetitionSep === 'string' &&
    msg[0].encodingCharacters.repetitionSep.length === 1 &&
    typeof msg[0].encodingCharacters?.escapeChar === 'string' &&
    msg[0].encodingCharacters.escapeChar.length === 1 &&
    ((typeof msg[0].encodingCharacters?.subCompRepSep === 'string' &&
      msg[0].encodingCharacters.subCompRepSep.length === 1) ||
      msg[0].encodingCharacters?.subCompRepSep === undefined) &&
    (typeof msg[0]?.version === 'string' || msg[0]?.version === undefined) &&
    ((typeof msg[0]?.messageCode === 'string' &&
      msg[0].messageCode.length === 3) ||
      msg[0]?.messageCode === undefined) &&
    ((typeof msg[0]?.triggerEvent === 'string' &&
      msg[0].triggerEvent.length === 3) ||
      msg[0]?.triggerEvent === undefined) &&
    (typeof msg[0]?.messageStructure === 'string' ||
      msg[0]?.messageStructure === undefined) &&
    (typeof msg[0]?.id === 'string' || msg[0]?.id === undefined) &&
    (msg[0]?.encodedAt instanceof Date ||
      typeof msg[0]?.encodedAt === 'string' ||
      typeof msg[0]?.encodedAt === 'number' ||
      msg[0]?.id === undefined)
  ) {
    const [, ...segments] = msg as Message;
    return segments.every((segs) => segs.every((seg) => isSegment(seg)));
  }
  return false;
};

export const isSegment = (segment: unknown, allowMultiple = false): boolean => {
  if (
    allowMultiple &&
    Array.isArray(segment) &&
    segment.every((s) => isSegment(s))
  )
    return true;
  if (
    Array.isArray(segment) &&
    typeof segment?.[0] === 'string' &&
    segment[0].length === 3
  ) {
    const [, ...fields] = segment as Segment;
    return fields.every((f) => isField(f));
  }
  return false;
};

export const isField = (field: unknown, allowRepeating = true): boolean => {
  if (
    allowRepeating &&
    Array.isArray(field) &&
    field.length > 0 &&
    typeof field[0] === 'object' &&
    field[0]?.rep === true
  ) {
    const [, ...fields] = field as FieldRep;
    return fields.every(isComponent);
  }
  return (
    (Array.isArray(field) && field.every(isComponent)) || isComponent(field)
  );
};

export const isComponent = (component: unknown): boolean =>
  (Array.isArray(component) && component.every(isSubComponent)) ||
  isSubComponent(component);

export const isSubComponent = (subcomponent: unknown): boolean =>
  typeof subcomponent === 'string' ||
  subcomponent === null ||
  subcomponent === undefined;
