import {
  DgraphClient,
  DgraphClientStub,
  Operation,
  Mutation,
  Request,
  Response,
} from 'dgraph-js';
import { credentials } from '@grpc/grpc-js';
import { IStoreClass, StoreFunc, StoreOption } from '../types';
import { randomUUID } from 'crypto';
import {
  StrictComponent,
  StrictField,
  StrictFieldRepetition,
  StrictMessage,
  StrictSegment,
  StrictSubComponent,
} from '@gofer-engine/hl7';

const schema = `
type Mesage {
  id
  meta
  segments
  Message.value
}
type MessageMeta {
  version
  messageCode
  triggerEvent
  messageStructure
  id
  encodedAt
  encodingCharacters
}
type EncodingCharacters {
  fieldSep
  componentSep
  subComponentSep
  repetitionSep
  escapeChar
  truncateChar
}
type Segment {
  Segment.position
  Segment.value
  Segment.name
  fields
}
type Field {
  Field.position
  Field.value
  repetitions
}
type FieldRep {
  FieldRep.position
  FieldRep.value
  components
}
type Component {
  Component.position
  Component.value
  subcomponents
}
type Subcomponent {
  Subcomponent.position
  value
}
id: string @index(exact) .
meta: uid @reverse .
segments: [uid] @reverse .
version: string .
messageCode: string .
triggerEvent: string .
messageStructure: string .
encodedAt: dateTime .
encodingCharacters: uid @reverse .
Segment.position: int .
Field.position: int .
FieldRep.position: int .
Component.position: int .
Subcomponent.position: int .
Message.value: string .
Segment.value: string .
Field.value: string .
FieldRep.value: string .
Component.value: string .
value: string @index(term, exact) .
Segment.name: string @index(exact) .
fields: [uid] @reverse .
repetitions: [uid] @reverse .
components: [uid] @reverse .
subcomponents: [uid] @reverse .
schemaVersion: int .
fieldSep: string .
componentSep: string .
subComponentSep: string .
repetitionSep: string .
escapeChar: string .
truncateChar: string .
`;

export interface IDBStoreOptions extends StoreOption {
  uri?: string;
  warnOnError?: boolean;
  verbose?: boolean;
}

type Node = {
  ['dgraph.type']: string[];
  uid?: string;
};

type StoredSubcomponent = Omit<StrictSubComponent, 'position'> &
  Node & {
    ['Subcomponent.position']: number;
  };

type StoredComponent = Omit<
  StrictComponent,
  'value' | 'position' | 'subComponents'
> &
  Node & {
    ['Component.position']: number;
    ['Component.value']: string;
    subcomponents: StoredSubcomponent[];
  };

type StoredFieldRep = Omit<
  StrictFieldRepetition,
  'value' | 'position' | 'components'
> &
  Node & {
    ['FieldRep.position']: number;
    ['FieldRep.value']: string;
    components: StoredComponent[];
  };

type StoredField = Omit<StrictField, 'value' | 'position' | 'repetitions'> &
  Node & {
    ['Field.position']: number;
    ['Field.value']: string;
    repetitions: StoredFieldRep[];
  };

type StoredSegment = Omit<
  StrictSegment,
  'value' | 'position' | 'name' | 'fields'
> &
  Node & {
    ['Segment.position']: number;
    ['Segment.value']: string;
    ['Segment.name']: string;
    fields: StoredField[];
  };

type StoredMessageMeta = StrictMessage['meta'] &
  Node & {
    encodingCharacters: StrictMessage['meta']['encodingCharacters'] & Node;
  };

type StoredMessage = Node & {
  id?: string;
  meta: StoredMessageMeta;
  segments: StoredSegment[];
  ['Message.value']: string;
};

class DBStore implements IStoreClass {
  private stubs: DgraphClientStub[];
  private db: DgraphClient;
  private warnOnError: NonNullable<IDBStoreOptions['warnOnError']>;
  private verbose: NonNullable<IDBStoreOptions['verbose']>;
  private id: NonNullable<IDBStoreOptions['id']>;
  constructor({
    uri = '172.0.0.1:9080',
    warnOnError = false,
    verbose = false,
    id = '$MSH-10.1',
  }) {
    this.stubs = [new DgraphClientStub(uri, credentials.createInsecure())];
    this.db = new DgraphClient(...this.stubs);
    this.warnOnError = warnOnError;
    this.verbose = verbose;
    this.id = id;
    // TODO: Figure out where to call this...
    // this.updateSchema()
  }
  public store: StoreFunc = async (data) => {
    const id =
      this.id === 'UUID'
        ? randomUUID()
        : this.id.match(/^\$[A-Z][A-Z0-9]{2}/)
        ? (data.get(this.id.slice(1) ?? randomUUID()) as string)
        : this.id;
    if (this.verbose) console.log('id: ', id);
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<boolean>(async (res, rej) => {
      try {
        const txn = this.db.newTxn({
          readOnly: false,
          bestEffort: false,
        });
        if (this.verbose) console.log('Txn Initiated');
        const content = this.typeMessage(data.json(true), id, data.toString());
        if (this.verbose) console.log('content: ', content);
        const mu = new Mutation();
        if (this.verbose) console.log('Mutation Initiated');
        mu.setSetJson(content);
        mu.setCommitNow(true);
        const response = await txn.mutate(mu);
        if (this.verbose) console.log('Mutation Committed');
        if (this.verbose)
          console.log('res.getMetrics: ', response.getMetrics());
        await txn.discard();
        res(true);
      } catch (err) {
        if (this.warnOnError) {
          console.warn(err);
          res(false);
        } else {
          rej(err);
        }
      }
    });
  };
  public close = async () => {
    await Promise.all(this.stubs.map((stub) => stub.close()));
    if (this.verbose) console.log(`Closed Dgraph Client`);
  };
  public updateSchema = async () => {
    const op = new Operation();
    op.setSchema(schema);
    op.setRunInBackground(true);
    await this.db.alter(op);
  };
  public typeMessage = (
    msg: StrictMessage,
    id: string,
    hl7: string
  ): StoredMessage => {
    return {
      id,
      ['dgraph.type']: ['Message'],
      meta: {
        ...msg.meta,
        ['dgraph.type']: ['MessageMeta'],
        encodingCharacters: {
          ...msg.meta.encodingCharacters,
          ['dgraph.type']: ['EncodingCharacters'],
        },
      },
      segments: [
        ...msg.segments.map<StoredSegment>((seg) => {
          return {
            ['dgraph.type']: ['Segment'],
            ['Segment.position']: seg.position,
            ['Segment.name']: seg.name,
            ['Segment.value']: seg.value,
            fields: seg.fields.map<StoredField>((field) => {
              return {
                ['dgraph.type']: ['Field'],
                ['Field.position']: field.position,
                ['Field.value']: field.value,
                repetitions: field.repetitions.map<StoredFieldRep>((rep) => {
                  return {
                    ['dgraph.type']: ['FieldRep'],
                    ['FieldRep.position']: rep.position,
                    ['FieldRep.value']: rep.value,
                    components: rep.components.map<StoredComponent>((comp) => {
                      return {
                        ['dgraph.type']: ['Component'],
                        ['Component.position']: comp.position,
                        ['Component.value']: comp.value,
                        // subComponents: subComponents
                        subcomponents: comp.subComponents.map((sub) => {
                          const subComponent: StoredSubcomponent = {
                            ['dgraph.type']: ['Subcomponent'],
                            ['Subcomponent.position']: sub.position,
                            value: sub.value,
                          };
                          return subComponent;
                        }),
                      };
                    }),
                  };
                }),
              };
            }),
          };
        }),
      ],
      ['Message.value']: hl7,
    };
  };
  public query = async (
    query: string,
    mutations?: Mutation[],
    variables?: Record<string, string>
  ): Promise<Response | undefined> => {
    const request = new Request();
    if (query) {
      if (variables) {
        const varsMap = request.getVarsMap();
        for (const property in variables) {
          varsMap.set(property, variables[property]);
        }
      }
      request.setQuery(query);
    }
    if (mutations) {
      request.setMutationsList(mutations);
    }
    request.setCommitNow(true);
    const txn = this.db.newTxn();
    let response: Response | undefined = undefined;

    try {
      response = await txn.doRequest(request);
    } catch (e) {
      if (this.warnOnError) {
        console.warn(e);
      } else {
        throw e;
      }
    } finally {
      await txn.discard();
    }

    return response;
  };
}

export default DBStore;
