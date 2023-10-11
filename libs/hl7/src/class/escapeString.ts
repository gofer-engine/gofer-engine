import { MessageMeta } from '../types';

export const escapeString = (str: string, meta: MessageMeta) => {
  const { escapeChar, fieldSep, componentSep, subComponentSep, repetitionSep } =
    meta.encodingCharacters;
  return str
    .split(escapeChar)
    .join(`${escapeChar}${escapeChar}`)
    .split(fieldSep)
    .join(`${escapeChar}${fieldSep}`)
    .split(componentSep)
    .join(`${escapeChar}${componentSep}`)
    .split(subComponentSep)
    .join(`${escapeChar}${subComponentSep}`)
    .split(repetitionSep)
    .join(`${escapeChar}${repetitionSep}`);
};

export const escapeSubComp = (
  value: string | null | undefined,
  meta: MessageMeta,
) => {
  if (value === undefined || value === null) return value;
  return escapeString(value, meta);
};
