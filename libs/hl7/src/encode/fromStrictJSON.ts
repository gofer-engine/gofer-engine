import {
  Component,
  Field,
  FieldRep,
  Message,
  Segment,
  StrictComponent,
  StrictMessage,
  SubComponent,
} from '../types'
import { deepCopy } from './deepCopy'
import { flattenSingleArrayItem } from './flattenSingleArrayItem'

const fromStrictComp = (comp: StrictComponent): Component => {
  const component: Component = comp.subComponents.map((subComp) => {
    let subComponent: SubComponent = subComp.value
    if (subComponent === '') subComponent = null
    return subComponent
  })
  return flattenSingleArrayItem(component)
}

export const fromStrictJSON = (_msg: StrictMessage): Message => {
  const msg = deepCopy(_msg)
  const { encodingCharacters, encodedAt, messageStructure, version, ...rest } =
    msg.meta
  return [
    {
      encodingCharacters,
      encodedAt:
        encodedAt === undefined ? undefined : new Date(Date.parse(encodedAt)),
      messageStructure: messageStructure as `${string}_${string}` | undefined,
      version: version as `${number}` | `${number}.${number}` | undefined,
      ...rest,
    },
    msg.segments.map((seg) => {
      const segment: Segment = [
        seg.name,
        ...seg.fields.map((field) => {
          if (field.repetitions.length > 1) {
            const fieldRep: FieldRep = [
              { rep: true },
              ...field.repetitions.map((repetition) => {
                const field: Field = repetition.components.map(fromStrictComp)
                return flattenSingleArrayItem(field)
              }),
            ]
            return fieldRep
          } else {
            const fields: Field =
              field.repetitions[0].components.map(fromStrictComp)
            return flattenSingleArrayItem(fields)
          }
        }),
      ]
      return segment
    }),
  ]
}
