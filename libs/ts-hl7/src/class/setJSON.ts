import Msg from './Message'
import {
  Component,
  Field,
  FieldRep,
  Message,
  MsgValue,
  Paths,
  Segment,
  SubComponent,
} from '../types'
import { isFieldRep } from './isFieldRep'
import {
  isMessage,
  isSubComponent,
  isComponent,
  isField,
  isSegment,
} from './isHL7JSON'
import { setComponent } from './setComponent'
import { setField } from './setField'
import { setFieldOrRep } from './setFieldOrRep'
import { setSegment } from './setSegment'
import { setSubComponent } from './setSubComponent'

export const setJSON = (
  msg: Msg,
  json: MsgValue,
  {
    segmentName,
    segmentIteration,
    fieldPosition,
    fieldIteration,
    componentPosition,
    subComponentPosition,
  }: Paths
): Msg => {
  if (segmentName === undefined) {
    if (isMessage(json)) {
      msg.setMsg(json as Message)
      return msg
    }
    console.warn(
      'The json was not a valid HL7 JSON Message. Returning the original message.'
    )
    return msg
  }
  if (
    subComponentPosition !== undefined &&
    componentPosition !== undefined &&
    fieldPosition !== undefined
  ) {
    if (isSubComponent(json)) {
      return msg.setMsg(
        setSubComponent(
          msg.raw(),
          segmentName,
          segmentIteration,
          fieldPosition,
          fieldIteration,
          componentPosition,
          subComponentPosition,
          json as SubComponent
        )
      )
    }
    console.warn(
      'The json was not a valid HL7 JSON SubComponent. Returning the original message.'
    )
    return msg
  }

  if (componentPosition !== undefined && fieldPosition !== undefined) {
    if (isComponent(json)) {
      return msg.setMsg(
        setComponent(
          msg.raw(),
          segmentName,
          segmentIteration,
          fieldPosition,
          fieldIteration,
          componentPosition,
          json as Component
        )
      )
    }
  }

  if (fieldPosition !== undefined) {
    if (isFieldRep(json as FieldRep)) {
      return msg.setMsg(
        setFieldOrRep(
          msg.raw(),
          segmentName,
          segmentIteration,
          fieldPosition,
          json as FieldRep
        )
      )
    }
    if (isField(json as Field)) {
      return msg.setMsg(
        setField(
          msg.raw(),
          segmentName,
          segmentIteration,
          fieldPosition,
          fieldIteration,
          json as Field
        )
      )
    }
    console.warn(
      'The json was not a valid HL7 JSON Field or FieldRep. Returning the original message.'
    )
  }
  if (isSegment(json)) {
    return msg.setMsg(
      setSegment(msg.raw(), segmentName, segmentIteration, json as Segment)
    )
  }

  console.warn(
    'The json was not a valid HL7 JSON Segment. Returning the original message.'
  )

  return msg
}
