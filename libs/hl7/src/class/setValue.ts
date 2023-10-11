import decodeHL7 from '../decode';
import { decodeComponent } from '../decode/decodeComponent';
import { decodeField } from '../decode/decodeField';
import { decodeSegment } from '../decode/decodeSegment';
import { decodeSubComponent } from '../decode/decodeSubComponent';
import { Field, FieldRep, Message, Paths } from '../types';
import { deleteSegment } from './deleteSegment';
import { isFieldRep } from './isFieldRep';
import { setComponent } from './setComponent';
import { setField } from './setField';
import { setFieldOrRep } from './setFieldOrRep';
import { setSegment } from './setSegment';
import { setSubComponent } from './setSubComponent';

export const setValue = (
  msg: Message,
  {
    segmentName,
    segmentIteration,
    fieldPosition,
    fieldIteration,
    componentPosition,
    subComponentPosition,
  }: Paths,
  value: string,
): Message => {
  // set the value as the entirity of the message, an empty path, means you are sending a stringified hl7 message.
  if (segmentName === undefined) {
    const [, segments] =
      decodeHL7(value, msg[0].encodingCharacters) ??
      ([undefined, []] as unknown as Message);
    return [msg[0], segments];
  }
  // cannot set a path where no segments currently exist, use addSegment instead.
  if (msg.length < 2 || msg[1].length === 0) {
    // FixMe: should this throw an error instead?
    return msg;
  }

  if (
    subComponentPosition !== undefined &&
    componentPosition !== undefined &&
    fieldPosition !== undefined
  ) {
    const [remaining, subComponent] = decodeSubComponent(value, [
      msg[0].encodingCharacters.subComponentSep,
    ]);
    if (remaining !== '') {
      // TODO: return more information, custom error/logging?
      console.warn('Leftover hl7 after decoding SubComponent');
    }
    return setSubComponent(
      msg,
      segmentName,
      segmentIteration,
      fieldPosition,
      fieldIteration,
      componentPosition,
      subComponentPosition,
      subComponent,
    );
  }

  if (componentPosition !== undefined && fieldPosition !== undefined) {
    const [remaining, component] = decodeComponent(
      value,
      [
        msg[0].encodingCharacters.componentSep,
        msg[0].encodingCharacters.subComponentSep,
      ],
      msg[0],
    );
    if (remaining !== '') {
      // TODO: return more information, custom error/logging?
      console.warn('Leftover hl7 after decoding Component');
    }
    return setComponent(
      msg,
      segmentName,
      segmentIteration,
      fieldPosition,
      fieldIteration,
      componentPosition,
      component,
    );
  }

  if (fieldPosition !== undefined) {
    const [remaining, field] = decodeField(
      value,
      [
        msg[0].encodingCharacters.componentSep,
        msg[0].encodingCharacters.subComponentSep,
      ],
      msg[0],
    );
    if (remaining !== '') {
      // TODO: return more information, custom error/logging?
      console.warn('Leftover hl7 after decoding Field');
    }
    if (isFieldRep(field)) {
      return setFieldOrRep(
        msg,
        segmentName,
        segmentIteration,
        fieldPosition,
        field as FieldRep,
      );
    }
    return setField(
      msg,
      segmentName,
      segmentIteration,
      fieldPosition,
      fieldIteration,
      field as Field,
    );
  }
  if (value === '') {
    return deleteSegment(msg, segmentName, segmentIteration);
  }
  const segment = decodeSegment(value, msg[0]);
  return setSegment(msg, segmentName, segmentIteration, segment);
};
