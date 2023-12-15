import { TransformFunc } from '@gofer-engine/engine';

export const addPrefix =
  (path: string, prefix?: string): TransformFunc =>
  (msg) =>
    msg.map(
      path,
      <T>(value: T) => `${prefix ?? ''}${value}` as T,
    );
