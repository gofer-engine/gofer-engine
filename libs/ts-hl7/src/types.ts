export type OneOrMany<T> = T | T[]

export type SubComponent = string | null | undefined

export type Component = OneOrMany<SubComponent>

export type Field = OneOrMany<Component>
export type FieldRep = [{ rep: true }, ...Field[]]
export type FieldOrRep = Field | FieldRep
export type FieldsOrReps = FieldOrRep[]

export type Segment = [name: string, ...fields: FieldsOrReps]
export type Segments = Segment[]

export interface MessageMeta {
  /**
   * MSH-12
   * length: 5
   * Table: 0104 @see https://hl7-definition.caristix.com/v2/HL7v2.5.1/Tables/0104
   * @example 2.5.1
   */
  version?: `${number}.${number}` | `${number}`
  /**
   * MSH-9.1
   * length: 3
   * Table: 0076 @see https://hl7-definition.caristix.com/v2/HL7v2.5.1/Tables/0076
   * @example ADT
   */
  messageCode?: string
  /**
   * MSH-9.2
   * length: 3
   * Table: 0003 @see https://hl7-definition.caristix.com/v2/HL7v2.5.1/Tables/0003
   * @example A01
   */
  triggerEvent?: string // MSH-9.2 length = 3
  /**
   * MSH-9.3
   * length: 7
   * Table 0354 @see https://hl7-definition.caristix.com/v2/HL7v2.5.1/Tables/0354
   * @example ADT_A01
   */
  messageStructure?: `${string}_${string}`
  /**
   * MSH-10
   * length: 20
   * datatype: ST
   * @example ABC-1234.1
   */
  messageControlId?: string
  encodedAt?: Date
  encodingCharacters: {
    fieldSep: string
    componentSep: string
    subComponentSep: string
    repetitionSep: string
    escapeChar: string
    truncateChar?: string
  }
}
export type Message = [MessageMeta, ...Segments[]]

export type FuncDecodeHL7 = (
  HL7: string,
  encodingCharacters?: MessageMeta['encodingCharacters']
) => Message | undefined
export type FuncGetEncodingChars = (
  segment: string
) => MessageMeta['encodingCharacters']
export type FuncDecodeSegment = (hl7: string, meta: MessageMeta) => Segment
export type FuncDecodeField = (
  hl7: string,
  meta: MessageMeta,
  fields?: FieldsOrReps
) => [hl7: string, fields: FieldsOrReps]
export type FuncDecodeComponent = (
  hl7: string,
  meta: MessageMeta,
  components?: Component[]
) => [hl7: string, field: Field]
export type FuncDecodeSubComponent = (
  hl7: string,
  meta: MessageMeta,
  subComponents?: Component[]
) => [hl7: string, component: Component]
export type RepType =
  | [{ rep: true }, ...(string | null | undefined)[]]
  | null
  | undefined
  | string
  | (null | string | undefined)[]
export type SepType = OneOrMany<RepType>
export type FuncDecodeRepSep<R extends RepType, S extends OneOrMany<R>> = (
  hl7: string,
  repChar: string | undefined,
  sepChar: string,
  callback: (hl7: string, stopChars: string[]) => [hl7: string, value: S]
) => [hl7: string, ...value: (OneOrMany<S> | null | undefined)[]]

export type MsgValue =
  | Message
  | Segments
  | Segment
  | FieldsOrReps
  | FieldRep
  | Field

export interface Paths {
  segmentName?: string
  segmentIteration?: number
  fieldPosition?: number
  fieldIteration?: number
  componentPosition?: number
  subComponentPosition?: number
}

type StrictEncodingCharacters = {
  fieldSep: string
  componentSep: string
  subComponentSep: string
  repetitionSep: string
  escapeChar: string
  truncateChar?: string
}

type StrictMessageMeta = {
  version?: string
  messageCode?: string
  triggerEvent?: string
  messageStructure?: string
  messageControlId?: string
  encodedAt?: string
  encodingCharacters: StrictEncodingCharacters
}

export type StrictSubComponent = {
  position: number
  value: string
}

export type StrictComponent = {
  position: number
  value: string
  subComponents: StrictSubComponent[]
}

export type StrictFieldRepetition = {
  position: number
  components: StrictComponent[]
  value: string
}

export type StrictField = {
  position: number
  value: string
  repetitions: StrictFieldRepetition[]
}

export type StrictSegment = {
  position: number
  value: string
  name: string
  fields: StrictField[]
}

export type StrictMessage = {
  meta: StrictMessageMeta
  segments: StrictSegment[]
}

export type NoPos<T extends { position?: number }> = Omit<T, 'position'>

export type IfTrueElse<
  B extends boolean | undefined,
  T,
  E
> = B extends undefined ? E : B extends true ? T : E
