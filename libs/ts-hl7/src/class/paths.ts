import { Paths } from '../types'

export const paths = (path?: string): Paths => {
  if (path === undefined || path === '') return {}
  const segRx = '([A-Z][A-Z0-9]{2})'
  const repRx = '(?:\\[([0-9]+)\\])'
  const posRx = '(?:[-\\.]([0-9]+))'
  const pathRx = new RegExp(
    `^(?:${segRx})${repRx}?(?:${posRx}${repRx}?(?:${posRx}${posRx}?)?)?$`
  )
  const paths = path.match(pathRx)
  if (paths === null) throw Error(`Could not parse path: ${path}`)
  const [
    ,
    segmentName,
    segmentIteration,
    fieldPosition,
    fieldIteration,
    componentPosition,
    subComponentPosition,
  ] = paths ?? []
  if (segmentIteration === '0')
    throw Error(`Segment Iteration in path ${path} cannot be 0.`)
  if (fieldPosition === '0')
    throw Error(`Field Position in path ${path} cannot be 0.`)
  if (fieldIteration === '0')
    throw Error(`Field Iteration in path ${path} cannot be 0.`)
  if (componentPosition === '0')
    throw Error(`Component Position in path ${path} cannot be 0.`)
  if (subComponentPosition === '0')
    throw Error(`Sub Component Position in path ${path} cannot be 0.`)
  return {
    segmentName,
    segmentIteration:
      segmentIteration === undefined ? undefined : parseInt(segmentIteration),
    fieldPosition:
      fieldPosition === undefined ? undefined : parseInt(fieldPosition),
    fieldIteration:
      fieldIteration === undefined ? undefined : parseInt(fieldIteration),
    componentPosition:
      componentPosition === undefined ? undefined : parseInt(componentPosition),
    subComponentPosition:
      subComponentPosition === undefined
        ? undefined
        : parseInt(subComponentPosition),
  }
}
