import { IMsgLimiter } from '.';

export type OneOrMany<T> = T | T[];

export type SubComponent = string | null | undefined;

export type Component = OneOrMany<SubComponent>;

export type Field = OneOrMany<Component>;
export type FieldRep = [{ rep: true }, ...Field[]];
export type FieldOrRep = Field | FieldRep;
export type FieldsOrReps = FieldOrRep[];

export type Segment = [name: string, ...fields: FieldsOrReps];
export type Segments = Segment[];

export interface ISub {
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, NoPos<StrictSubComponent>, SubComponent>;
  toString: () => string;
}

export interface ISubs {
  toString: (subCompSep?: string) => string;
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, StrictSubComponent[], SubComponent[]>;
}

export interface IMultiSubs {
  toString: (subCompSep?: string, compSep?: string) => string;
  json: () => SubComponent[][];
}

export interface ICmp {
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, NoPos<StrictComponent>, Component>;
  one: () => ICmp;
  all: () => ICmp[];
  toString: (options?: { subCompSep?: string }) => string;
  getSubComponent: (position?: number) => ISub;
  getSubComponents: (position?: number) => ISub[];
}

export interface ICmps {
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, StrictComponent[], Component[]>;
  one: (iteration?: number) => ICmp;
  all: () => ICmp[];
  toString: (
    options?: {
      subCompSep?: string;
      fieldRepSep?: string;
    },
    stringify?: boolean
  ) => string | string[];
  getSubComponent: (position?: number) => ISubs;
  getSubComponents: (position?: number) => ISub[][];
}

export interface IRep {
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, NoPos<StrictFieldRepetition>, Field>;
  toString: (options?: {
    compSep?: string;
    subCompSep?: string;
    escChar?: string;
  }) => string;
  getComponent: (position?: number) => ICmp;
  getComponents: () => ICmp[];
}

export interface IFld {
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, NoPos<StrictField>, Field | FieldRep>;
  toString: (options?: {
    compSep?: string;
    subCompSep?: string;
    repSep?: string;
    escChar?: string;
  }) => string;
  getRepetitions: () => IRep[];
  getComponent: (position?: number) => ICmp | ICmps;
  getComponents: () => ICmp[];
}

export interface IFlds {
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, StrictField[], Field[]>;
  one: () => IFld;
  toString: (options?: {
    fieldSep?: string;
    compSep?: string;
    subCompSep?: string;
    repSep?: string;
    escChar?: string;
  }) => string;
  getComponent: (position: number | undefined) => ICmp | ICmps;
  getComponents: () => ICmps;
}

export interface ISeg {
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, NoPos<StrictSegment>, Segment>;
  toString: (options?: {
    fieldSep?: string;
    compSep?: string;
    subCompSep?: string;
    repSep?: string;
    escChar?: string;
  }) => string;
  getName: () => string;
  getField: (
    fieldPosition: number,
    // NOTE: iteration is 1-indexed
    fieldIteration?: number | undefined
  ) => IFld;
  getFields: () => IFld[];
}

export interface ISegs {
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, StrictSegment[], Segments>;
  toString: () => string;
  one: (position: number) => ISeg;
  all: () => ISeg[];
  getField: (
    fieldPosition: number,
    // NOTE: iteration is 1-indexed
    fieldIteration?: number | undefined
  ) => IFlds;
  getFields: () => IFld[][];
}

export interface IMsg {
  setMsg: (msg: Message) => IMsg;
  json: <S extends boolean | undefined = undefined>(
    strict?: S
  ) => IfTrueElse<S, StrictMessage, Message>;
  addSegment: (
    segment: string | Segment | ISeg | ISegs,
    after?: number | string
  ) => IMsg;
  toString: () => string;
  set: (path?: string | undefined, value?: string | null | undefined) => IMsg;
  setJSON: (
    path: string | undefined,
    json: Message | Segments | Segment | FieldsOrReps | FieldRep | Field
  ) => IMsg;
  get: (path: string | undefined) =>
    | string
    | Message
    | ISeg
    | {
        rep: true;
      }
    | (
        | string
        | FieldRep
        | ISeg
        | {
            rep: true;
          }
        | Field[]
        | null
        | undefined
      )[]
    | null
    | undefined;
  getSegments: (name?: string | undefined) => ISeg[];
  getSegment: (
    name?: string | undefined,
    // NOTE: iteration is 1-indexed
    // NOTE: if undefined, returns first segment
    iteration?: number | undefined
  ) => ISeg | ISegs;
  id: (id?: string | undefined) => string | undefined;
  transform: (transformers: IMsgLimiter) => IMsg;
  delete: (path: string) => IMsg;
  copy: (path: string, toPath: string) => IMsg;
  move: (fromPath: string, toPath: string) => IMsg;
  map: (
    path: string,
    v: string | Record<string, string> | string[] | (<T>(v: T, i: number) => T),
    options?: {
      iteration?: boolean | undefined;
    }
  ) => IMsg;
  setIteration: <Y>(
    path: string,
    map: Y[] | ((val: Y, i: number) => Y),
    options?: { allowLoop: boolean }
  ) => IMsg;
}

export interface MessageMeta {
  /**
   * MSH-12
   * length: 5
   * Table: 0104 @see https://hl7-definition.caristix.com/v2/HL7v2.5.1/Tables/0104
   * @example 2.5.1
   */
  version?: `${number}.${number}` | `${number}`;
  /**
   * MSH-10
   * length: 20
   */
  id?: string;
  /**
   * MSH-9.1
   * length: 3
   * Table: 0076 @see https://hl7-definition.caristix.com/v2/HL7v2.5.1/Tables/0076
   * @example ADT
   */
  messageCode?: string;
  /**
   * MSH-9.2
   * length: 3
   * Table: 0003 @see https://hl7-definition.caristix.com/v2/HL7v2.5.1/Tables/0003
   * @example A01
   */
  triggerEvent?: string; // MSH-9.2 length = 3
  /**
   * MSH-9.3
   * length: 7
   * Table 0354 @see https://hl7-definition.caristix.com/v2/HL7v2.5.1/Tables/0354
   * @example ADT_A01
   */
  messageStructure?: `${string}_${string}`;
  /**
   * MSH-10
   * length: 20
   * datatype: ST
   * @example ABC-1234.1
   */
  messageControlId?: string;
  encodedAt?: Date;
  encodingCharacters: {
    fieldSep: string;
    componentSep: string;
    subComponentSep: string;
    repetitionSep: string;
    escapeChar: string;
    truncateChar?: string;
  };
}
export type Message = [MessageMeta, ...Segments[]];

export type FuncDecodeHL7 = (
  HL7: string,
  encodingCharacters?: MessageMeta['encodingCharacters']
) => Message | undefined;
export type FuncGetEncodingChars = (
  segment: string
) => MessageMeta['encodingCharacters'];
export type FuncDecodeSegment = (hl7: string, meta: MessageMeta) => Segment;
export type FuncDecodeField = (
  hl7: string,
  meta: MessageMeta,
  fields?: FieldsOrReps
) => [hl7: string, fields: FieldsOrReps];
export type FuncDecodeComponent = (
  hl7: string,
  meta: MessageMeta,
  components?: Component[]
) => [hl7: string, field: Field];
export type FuncDecodeSubComponent = (
  hl7: string,
  meta: MessageMeta,
  subComponents?: Component[]
) => [hl7: string, component: Component];
export type RepType =
  | [{ rep: true }, ...(string | null | undefined)[]]
  | null
  | undefined
  | string
  | (null | string | undefined)[];
export type SepType = OneOrMany<RepType>;
export type FuncDecodeRepSep<R extends RepType, S extends OneOrMany<R>> = (
  hl7: string,
  repChar: string | undefined,
  sepChar: string,
  callback: (hl7: string, stopChars: string[]) => [hl7: string, value: S]
) => [hl7: string, ...value: (OneOrMany<S> | null | undefined)[]];

export type MsgValue =
  | Message
  | Segments
  | Segment
  | FieldsOrReps
  | FieldRep
  | Field;

export interface Paths {
  segmentName?: string;
  segmentIteration?: number;
  fieldPosition?: number;
  fieldIteration?: number;
  componentPosition?: number;
  subComponentPosition?: number;
}

type StrictEncodingCharacters = {
  fieldSep: string;
  componentSep: string;
  subComponentSep: string;
  repetitionSep: string;
  escapeChar: string;
  truncateChar?: string;
};

type StrictMessageMeta = {
  version?: string;
  messageCode?: string;
  triggerEvent?: string;
  messageStructure?: string;
  messageControlId?: string;
  encodedAt?: string;
  encodingCharacters: StrictEncodingCharacters;
};

export type StrictSubComponent = {
  position: number;
  value: string;
};

export type StrictComponent = {
  position: number;
  value: string;
  subComponents: StrictSubComponent[];
};

export type StrictFieldRepetition = {
  position: number;
  components: StrictComponent[];
  value: string;
};

export type StrictField = {
  position: number;
  value: string;
  repetitions: StrictFieldRepetition[];
};

export type StrictSegment = {
  position: number;
  value: string;
  name: string;
  fields: StrictField[];
};

export type StrictMessage = {
  meta: StrictMessageMeta;
  segments: StrictSegment[];
};

export type NoPos<T extends { position?: number }> = Omit<T, 'position'>;

export type IfTrueElse<
  B extends boolean | undefined,
  T,
  E
> = B extends undefined ? E : B extends true ? T : E;
