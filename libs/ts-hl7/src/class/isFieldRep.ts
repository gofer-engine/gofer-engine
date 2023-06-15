import { FieldOrRep } from '../types'

export const isFieldRep = (field: FieldOrRep): boolean => {
  if (!Array.isArray(field)) return false
  if (typeof field[0] !== 'object') return false
  if (field[0] === null) return false
  if (Array.isArray(field[0])) return false
  if (!field[0].hasOwnProperty('rep')) return false
  if (!field[0].rep) return false
  return true
}
