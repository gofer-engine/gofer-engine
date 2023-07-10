import { FuncGetEncodingChars } from '../types'

export const getEncodingChars: FuncGetEncodingChars = (HL7) => {
  if (HL7.startsWith('MSH')) {
    HL7 = HL7.slice(3)
  }
  const fieldSep = HL7.slice(0, 1)
  const componentSep =
    HL7.slice(1, 2) === fieldSep ? undefined : HL7.slice(1, 2)
  const repetitionSep =
    componentSep === undefined || HL7.slice(2, 3) === fieldSep
      ? undefined
      : HL7.slice(2, 3)
  const escapeChar =
    componentSep === undefined ||
    repetitionSep === undefined ||
    HL7.slice(3, 4) === fieldSep
      ? undefined
      : HL7.slice(3, 4)
  const subComponentSep =
    componentSep === undefined ||
    repetitionSep === undefined ||
    escapeChar === undefined ||
    HL7.slice(4, 5) === fieldSep
      ? undefined
      : HL7.slice(4, 5)
  const truncateChar =
    componentSep === undefined ||
    repetitionSep === undefined ||
    escapeChar === undefined ||
    subComponentSep === undefined ||
    HL7.slice(5, 6) === fieldSep
      ? undefined
      : HL7.slice(5, 6)
  if (
    fieldSep === undefined ||
    componentSep === undefined ||
    repetitionSep === undefined ||
    escapeChar === undefined ||
    subComponentSep === undefined
  ) {
    throw new Error(
      `Invalid encoding characters: ${JSON.stringify({
        fieldSep,
        componentSep,
        repetitionSep,
        escapeChar,
        subComponentSep,
      })}`
    )
  }
  return {
    fieldSep: fieldSep,
    componentSep: componentSep,
    repetitionSep: repetitionSep,
    escapeChar: escapeChar,
    subComponentSep: subComponentSep,
    truncateChar: truncateChar,
  }
}
