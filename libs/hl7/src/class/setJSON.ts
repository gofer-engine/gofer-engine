import {
  Component,
  Field,
  FieldRep,
  HL7v2,
  Message,
  MsgValue,
  Paths,
  Segment,
  SubComponent,
} from '../types';
import { isFieldRep } from './isFieldRep';
import {
  isMessage,
  isSubComponent,
  isComponent,
  isField,
  isSegment,
} from './isHL7JSON';
import { setComponent } from './setComponent';
import { setField } from './setField';
import { setFieldOrRep } from './setFieldOrRep';
import { setSegment } from './setSegment';
import { setSubComponent } from './setSubComponent';

export const setJSON = (
  msg: HL7v2,
  json: MsgValue,
  {
    segmentName,
    segmentIteration,
    fieldPosition,
    fieldIteration,
    componentPosition,
    subComponentPosition,
  }: Paths,
): HL7v2 => {
  if (segmentName === undefined) {
    if (isMessage(json)) {
      msg.setMsg(json as Message);
      return msg;
    }
    console.warn(
      'The json was not a valid HL7 JSON Message. Returning the original message.',
    );
    return msg;
  }
  if (
    subComponentPosition !== undefined &&
    componentPosition !== undefined &&
    fieldPosition !== undefined
  ) {
    if (isSubComponent(json)) {
      return msg.setMsg(
        setSubComponent(
          msg.json(),
          segmentName,
          segmentIteration,
          fieldPosition,
          fieldIteration,
          componentPosition,
          subComponentPosition,
          json as SubComponent,
        ),
      );
    }
    console.warn(
      'The json was not a valid HL7 JSON SubComponent. Returning the original message.',
    );
    return msg;
  }

  if (componentPosition !== undefined && fieldPosition !== undefined) {
    if (isComponent(json)) {
      return msg.setMsg(
        setComponent(
          msg.json(),
          segmentName,
          segmentIteration,
          fieldPosition,
          fieldIteration,
          componentPosition,
          json as Component,
        ),
      );
    }
  }

  if (fieldPosition !== undefined) {
    if (isFieldRep(json as FieldRep)) {
      return msg.setMsg(
        setFieldOrRep(
          msg.json(),
          segmentName,
          segmentIteration,
          fieldPosition,
          json as FieldRep,
        ),
      );
    }
    if (isField(json as Field)) {
      return msg.setMsg(
        setField(
          msg.json(),
          segmentName,
          segmentIteration,
          fieldPosition,
          fieldIteration,
          json as Field,
        ),
      );
    }
    console.warn(
      'The json was not a valid HL7 JSON Field or FieldRep. Returning the original message.',
    );
  }
  if (isSegment(json)) {
    return msg.setMsg(
      setSegment(msg.json(), segmentName, segmentIteration, json as Segment),
    );
  }

  throw new Error('The json was not a valid HL7 JSON.');
};
