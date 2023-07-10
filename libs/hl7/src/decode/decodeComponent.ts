import { Component, MessageMeta } from '../types'
import { decodeRepSep } from './decodeRepSep'
import { decodeSubComponent } from './decodeSubComponent'
import { findCharsFirstPos } from './findCharsFirstPos'

export const decodeComponent = (
  input: string,
  stCh: string[],
  meta: MessageMeta
): [
  remaining: string,
  value: Component
  // value: OneOrMany<string> | null | undefined
] => {
  const i = findCharsFirstPos(input, stCh)
  const [, val] = decodeRepSep(
    input.slice(0, i),
    undefined,
    meta.encodingCharacters.subComponentSep,
    (input, sc) => decodeSubComponent(input, [...stCh, ...sc])
  )
  input = input.slice(i)
  return [input, val]
}
