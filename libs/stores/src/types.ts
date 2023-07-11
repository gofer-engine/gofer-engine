import { IMsg } from '@gofer-engine/hl7';

export interface IStoreClass {
  store: StoreFunc;
  close: () => Promise<void>;
  query: (query: string) => Promise<unknown>;
}

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StoreFunc = (data: IMsg, id?: string) => Promise<boolean>;

/**
 * @param id - When defined in the Store Config, this id prop accepts a HL7 reference like `$MSH-10.1`. Or can also use `UUID` to generate a universally unique identifier.
 * @ignore Some stores may not support externally assigned identifiers, so then `id` should simply be ignored.
 * @todo Support multiple HL7 references in a formatted reference like `${MSH-9.1}_${MSH-10-1}`
 */
export interface StoreOption {
  id?: string;
}
