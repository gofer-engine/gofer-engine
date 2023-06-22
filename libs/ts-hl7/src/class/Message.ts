import { addSegment } from './addSegment'
import { getSegments } from './getSegments'
import { setValue } from './setValue'
import { Seg, Segs } from './Segment'
import { IMsgLimiter, transform } from './transform'
import decode from '../decode'
import encode from '../encode'
import {
  Field,
  FieldRep,
  FieldsOrReps,
  Message,
  MsgValue,
  Segment,
  Segments,
  IfTrueElse,
  StrictMessage,
} from '../types'
import { get } from './get'
import { paths, toPath } from './paths'
import { setJSON } from './setJSON'
import { deepCopy } from '../encode/deepCopy'
import { fromStrictJSON } from '../encode/fromStrictJSON'

/** MESSAGE
 * A message is the atomic unit of data transferred between systems. It is comprised of a group of segments in a defined sequence. Each message has a message type that defines its purpose. For example the ADT Message type is used to transmit portions of a patient's Patient Administration (ADT) data from one system to another. A three-character code contained within each message identifies its type. These are listed in the Message Type list, Appendix A.
 * The real-world event that initiates an exchange of messages is called a trigger event. See Section 2.3.1, "Trigger events," for a more detailed description of trigger events. Refer to HL7 Table 0003 - Event type for a listing of all defined trigger events. These codes represent values such as A patient is admitted or An order event occurred. There is a one-to-many relationship between message types and trigger event codes. The same trigger event code may not be associated with more than one message type; however a message type may be associated with more than one trigger event code.
 * All message types and trigger event codes beginning with the letter "Z" are reserved for locally defined messages. No such codes will be defined within the HL7 Standard.
 *
 * @see http://www.hl7.eu/HL7v2x/v251/std251/ch02.html#Heading11
 */
export class Msg {
  private _msg: Message = [
    {
      encodingCharacters: {
        fieldSep: '|',
        componentSep: '^',
        subComponentSep: '&',
        repetitionSep: '~',
        escapeChar: '\\',
      },
    },
    [['MSH', '|', '^~\\&']],
  ]
  private msg: Message
  public setMsg = (msg: Message) => {
    this.msg = msg
    return this
  }
  public json = <S extends boolean | undefined = undefined>(
    strict?: S
  ): IfTrueElse<S, StrictMessage, Message> => {
    if (strict) {
      const msg = deepCopy(this.msg)
      const { encodedAt, encodingCharacters, ...meta } = msg[0]
      const segs = this.getSegments()
      const message: StrictMessage = {
        meta: {
          encodedAt: encodedAt?.toISOString(),
          encodingCharacters,
          ...meta,
        },
        segments: segs.map((seg, i) => {
          return {
            position: i + 1,
            ...seg.json(true),
          }
        }),
      }
      return message as IfTrueElse<S, StrictMessage, Message>
    }
    return this.msg as IfTrueElse<S, StrictMessage, Message>
  }
  constructor(msg?: Message | string | StrictMessage) {
    if (typeof msg === 'string') {
      this.msg = decode(msg) ?? this._msg
    } else if (Array.isArray(msg)) {
      this.msg = msg
    } else if (msg !== undefined) {
      this.msg = fromStrictJSON(msg)
    } else {
      this.msg = this._msg
    }
    const version = this.get('MSH-12.1')
    const messageCode = this.get('MSH-9.1')
    const triggerEvent = this.get('MSH-9.2')
    const messageStructure = this.get('MSH-9.3')
    const messageControlId = this.get('MSH-10.1')

    this.msg[0].version = version as Message[0]['version']
    this.msg[0].messageCode = messageCode as Message[0]['messageCode']
    this.msg[0].triggerEvent = triggerEvent as Message[0]['triggerEvent']
    this.msg[0].messageStructure =
      messageStructure as Message[0]['messageStructure']
    this.msg[0].messageControlId =
      messageControlId as Message[0]['messageControlId']
  }

  /**
   * 
   * @param segment - the segment to add.
   * @param after the segment to add after. 
   *  - If a `string`, it must be a segment name and optional iteration. Example `"MSH"` or `"OBR[2]"`
   *  - If a `number`, then it 1-based index of the segments to add after.
   *  - If `< 0` then it will be the index from the end of the message.
   *  - If `0` then it will be the beginning of the message.
   *  - If `undefined`, then it will be the end of the message.
   * @returns the transformed `Msg` class
   */
  public addSegment = (segment: string | Segment | Seg | Segs, after?: number | string) => {
    const transformedMsg = addSegment(segment, this.msg, after)
    if (transformedMsg === false) {
      throw new Error('Could not addSegment')
    }
    this.msg = transformedMsg
    return this
  }

  public toString = () => {
    return encode(this.msg)
  }

  private _paths = paths
  private _toPath = toPath

  public set = (path: string | undefined, value: string | null | undefined) => {
    if (typeof value !== 'string') value = ''
    this.msg = setValue(this.msg, this._paths(path), value)
    return this
  }

  public setJSON = (
    path: string | undefined,
    json: Message | Segments | Segment | FieldsOrReps | FieldRep | Field
  ): Msg => setJSON(this, json, this._paths(path))

  public get = (path: string | undefined) => {
    if (path === undefined) return this.msg
    const {
      segmentName,
      segmentIteration,
      fieldPosition,
      fieldIteration,
      componentPosition,
      subComponentPosition,
    } = this._paths(path)
    return this._get(
      segmentName,
      segmentIteration,
      fieldPosition,
      fieldIteration,
      componentPosition,
      subComponentPosition
    )
  }

  // public delete = ()

  public getSegments = (segmentName?: string | undefined) =>
    getSegments(this.msg, segmentName).map((s) => new Seg(s))

  public getSegment = (
    segmentName: string | undefined,
    // NOTE: iteration is 1-indexed
    // NOTE: if undefined, returns first segment
    iteration: number | undefined = undefined
  ): Seg | Segs => {
    const segments = getSegments(this.msg, segmentName)
    if (iteration === undefined && segments.length > 1) {
      return new Segs(segments)
    }
    return new Seg(segments?.[(iteration ?? 1) - 1])
  }

  private _get = (
    segmentName: string | undefined,
    segmentIteration?: number | undefined,
    fieldPosition?: number | undefined,
    fieldIteration?: number | undefined,
    componentPosition?: number | undefined,
    subComponentPosition?: number | undefined
  ) =>
    get(
      this,
      segmentName,
      segmentIteration,
      fieldPosition,
      fieldIteration,
      componentPosition,
      subComponentPosition
    )

  public transform = (transformers: IMsgLimiter) => {
    this.msg = transform(this.msg, transformers)
    return this
  }

  public delete = (path: string) => {
    return this.set(path, '')
  }

  public copy = (fromPath: string, toPath: string) =>
    this.set(toPath, this.get(fromPath)?.toString())

  public move = (fromPath: string, toPath: string) =>
    this.set(toPath, this.get(fromPath)?.toString()).delete(fromPath)

  public map = <X = unknown>(
    path: string,
    v:
      | string
      | Record<string, string>
      | string[]
      | (<T extends X>(v: T, i: number) => T),
    { iteration }: { iteration?: boolean } = {}
  ) => {
    if (typeof v === 'string') return this.set(path, v)
    if (typeof v === 'function') {
      const original = this.get(path)
      if (iteration && Array.isArray(original)) {
        const paths = this._paths(path)
        if (!paths.segmentIteration) {
          // assume here that the array is a segment iteration
          original.forEach((orig, i) => {
            const replacement = v(orig as X, i + 1)
            this.setJSON(
              this._toPath({ ...paths, segmentIteration: i + 1 }),
              replacement instanceof Seg
                ? replacement.json()
                : (replacement as MsgValue)
            )
          })
          return this
        }
        if (!paths.fieldIteration) {
          // assume here that the array is a field iteration
          original.forEach((orig, i) => {
            const replacement = v(orig as X, i + 1)
            this.setJSON(
              this._toPath({ ...paths, fieldIteration: i + 1 }),
              replacement instanceof Seg
                ? replacement.json()
                : (replacement as MsgValue)
            )
          })
          return this
        }
      }
      const replacement = v(original as X, 1)
      if (replacement instanceof Seg) {
        this.setJSON(path, replacement.json())
      }
      // if (typeof replacement !== 'string') replacement = replacement?.toString()
      return this.setJSON(path, replacement as MsgValue)
    }
    const original = this.get(path)?.toString() ?? ''
    if (Array.isArray(v)) {
      const index = parseInt(original)
      if (isNaN(index)) {
        console.warn(
          'Value at path was not a number, so could not use to index map array. Returning original message.'
        )
        return this
      }
      return this.set(path, v?.[index] ?? '')
    }
    if (!Object.prototype.hasOwnProperty.call(v, original)) {
      console.warn(
        'Value at path was not a key in the map object. Returning original message.'
      )
      return this
    }
    return this.set(path, v?.[original] ?? '')
  }

  public setIteration = <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    options?: { allowLoop: boolean }
  ) =>
    this.map<Y>(
      path,
      (val, i) => {
        if (Array.isArray(map)) {
          i = i - 1
          if (options?.allowLoop) {
            i = i % map.length
          }
          return map?.[i] as typeof val
        }
        return map(val, i) as typeof val
      },
      { iteration: true }
    )
}

export default Msg
