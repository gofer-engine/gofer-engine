import encodeHL7 from '../encode'
import {
  FieldRep,
  IfTrueElse,
  NoPos,
  Segment,
  Segments,
  StrictSegment,
} from '../types'
import { Fld, Flds } from './Field'

export class Seg {
  private _seg: Segment
  private _fieldSep = '|'
  private _compSep = '^'
  private _subCompSep = '&'
  private _repSep = '~'
  private _escChar = '\\'
  constructor(segment: Segment) {
    this._seg = segment
  }

  /**
   * @deprecated replace with `json()`
   */
  public raw = () => this._seg

  public json = <S extends boolean | undefined = undefined>(
    strict?: S
  ): IfTrueElse<S, NoPos<StrictSegment>, Segment> => {
    if (strict) {
      const segment: NoPos<StrictSegment> = {
        name: this.getName(),
        value: this.toString() ?? '',
        fields: this.getFields().map((fld, i) => {
          return {
            position: i + 1,
            ...fld.json(true),
          }
        }),
      }
      return segment as IfTrueElse<S, NoPos<StrictSegment>, Segment>
    }
    return this._seg as IfTrueElse<S, NoPos<StrictSegment>, Segment>
  }

  public toString = ({
    fieldSep = this._fieldSep,
    compSep = this._compSep,
    subCompSep = this._subCompSep,
    repSep = this._repSep,
    escChar = this._escChar,
  } = {}) => {
    this._fieldSep = fieldSep
    this._compSep = compSep
    this._subCompSep = subCompSep
    this._repSep = repSep
    this._escChar = escChar
    return encodeHL7([
      {
        encodingCharacters: {
          fieldSep,
          componentSep: compSep,
          subComponentSep: subCompSep,
          repetitionSep: repSep,
          escapeChar: escChar,
        },
      },
      [this._seg],
    ])
  }

  public getName = () => this._seg[0]

  public getField = (
    fieldPosition: number,
    // NOTE: iteration is 1-indexed
    fieldIteration?: number | undefined
  ): Fld => {
    const field = this._seg?.[fieldPosition]
    if (
      fieldIteration !== undefined &&
      Array.isArray(field) &&
      field.length > 1 &&
      typeof field[0] === 'object' &&
      field[0]?.hasOwnProperty('rep')
    ) {
      const [, ...fields] = field as FieldRep
      return new Fld(fields?.[fieldIteration - 1] ?? null)
    } else if (fieldIteration !== undefined) {
      return new Fld(null)
    }
    return new Fld(field)
  }

  public getFields = () => {
    const fields: Fld[] = []
    const fieldCount = this._seg.length
    for (let i = 1; i < fieldCount; i++) {
      fields.push(this.getField(i))
    }
    return fields
  }
}

export class Segs {
  private _segs: Segments

  constructor(segments: Segments) {
    this._segs = segments
  }

  public json = <S extends boolean | undefined = undefined>(
    strict?: S
  ): IfTrueElse<S, StrictSegment[], Segments> => {
    if (strict) {
      return this._segs.map((seg, i) => {
        return {
          position: i + 1,
          ...new Seg(seg).json(true),
        }
      }) as IfTrueElse<S, StrictSegment[], Segments>
    }
    return this._segs as IfTrueElse<S, StrictSegment[], Segments>
  }

  public one = (segmentPosition: number): Seg =>
    new Seg(this._segs[segmentPosition - 1] ?? null)
  public all = (): Seg[] => this._segs.map((s) => new Seg(s))

  public getField = (
    fieldPosition: number,
    // NOTE: iteration is 1-indexed
    fieldIteration?: number | undefined
  ): Flds =>
    new Flds(
      this._segs.map((s) => new Seg(s).getField(fieldPosition, fieldIteration))
    )

  public getFields = (): Fld[][] =>
    this._segs.map((s) => new Seg(s).getFields())

  public toString = (): string =>
    this._segs.map((s) => new Seg(s).toString()).join('\n')
}
