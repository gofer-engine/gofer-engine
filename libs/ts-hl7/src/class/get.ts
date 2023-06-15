import { Component, Field, FieldOrRep, FieldRep } from '../types'
import Msg from './Message'
import { Seg } from './Segment'

export const get = (
  msg: Msg,
  segmentName: string | undefined,
  segmentIteration?: number | undefined,
  fieldPosition?: number | undefined,
  fieldIteration?: number | undefined,
  componentPosition?: number | undefined,
  subComponentPosition?: number | undefined
):
  | string
  | Seg
  | { rep: true }
  | (string | Seg | FieldRep | { rep: true } | Field[] | null | undefined)[]
  | null
  | undefined => {
  const ret = msg
    .getSegments(segmentName) // Seg[]
    .filter((_, i) => {
      if (segmentIteration === undefined) return true
      return i === segmentIteration - 1
    }) // Seg[]
    .map<Seg | FieldOrRep>((seg) => {
      if (fieldPosition === undefined) return seg // Seg
      return seg.raw()?.[fieldPosition] as FieldOrRep // FieldOrRep
    }) // Seg | FieldOrRep
    .map((field) => {
      if (
        Array.isArray(field) &&
        field.length > 1 &&
        typeof field[0] === 'object' &&
        field[0]?.hasOwnProperty('rep')
      ) {
        // is a repeating field...
        let f: Component[] | Field[] = []
        if (fieldIteration === undefined) {
          f = [...field] as Component[] | Field[]
          f.shift()
        } else if (Array.isArray(field) && fieldIteration > 0) {
          f = (field as unknown[]).filter((f, i) => {
            if (fieldIteration === undefined) return true
            return i === fieldIteration
          }) as Component[] | Field[]
        }
        if (componentPosition !== undefined && componentPosition > 0) {
          f = f
            .map((comp) => comp?.[componentPosition - 1])
            .map((comp) => {
              if (
                !Array.isArray(comp) ||
                subComponentPosition === undefined ||
                subComponentPosition < 1
              )
                return comp
              return comp?.[subComponentPosition - 1]
            })
        }
        if (Array.isArray(f) && f.length === 1) {
          return f[0]
        }
        return f
      }
      if (Array.isArray(field)) {
        if (componentPosition === undefined || componentPosition < 1)
          return field
        const comp = field?.[componentPosition - 1]
        if (
          !Array.isArray(comp) ||
          subComponentPosition === undefined ||
          subComponentPosition < 1
        )
          return comp
        return comp?.[subComponentPosition - 1]
      }
      return field // Seg | FieldOrRep
    })
  if (ret.length === 1) return ret[0]
  return ret
}
