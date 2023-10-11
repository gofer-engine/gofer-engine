import { Paths } from '../types';

export const paths = (path?: string): Paths => {
  if (path === undefined || path === '') return {};
  const segRx = '([A-Z][A-Z0-9]{2})';
  const repRx = '(?:\\[([0-9]+)\\])';
  const posRx = '(?:[-\\.]([0-9]+))';
  const pathRx = new RegExp(
    `^(?:${segRx})${repRx}?(?:${posRx}${repRx}?(?:${posRx}${posRx}?)?)?$`,
  );
  const paths = path.match(pathRx);
  if (paths === null) throw Error(`Could not parse path: ${path}`);
  const [
    ,
    segmentName,
    segmentIteration,
    fieldPosition,
    fieldIteration,
    componentPosition,
    subComponentPosition,
  ] = paths ?? [];
  if (segmentIteration === '0')
    throw Error(`Segment Iteration in path ${path} cannot be 0.`);
  if (fieldPosition === '0')
    throw Error(`Field Position in path ${path} cannot be 0.`);
  if (fieldIteration === '0')
    throw Error(`Field Iteration in path ${path} cannot be 0.`);
  if (componentPosition === '0')
    throw Error(`Component Position in path ${path} cannot be 0.`);
  if (subComponentPosition === '0')
    throw Error(`Sub Component Position in path ${path} cannot be 0.`);
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
  };
};

export const toPath = ({
  segmentName,
  segmentIteration,
  fieldPosition,
  fieldIteration,
  componentPosition,
  subComponentPosition,
}: Paths): string => {
  // build the path in reverse order
  let path = '';
  // TODO: check that the Path input validity (cannot have subComponentPosition without componentPosition, etc.)
  if (subComponentPosition && !componentPosition)
    throw Error('Cannot have subComponentPosition without componentPosition');
  if (componentPosition && !fieldPosition)
    throw Error('Cannot have componentPosition without fieldPosition');
  if (fieldIteration && !fieldPosition)
    throw Error('Cannot have fieldIteration without fieldPosition');
  if (fieldPosition && !segmentName)
    throw Error('Cannot have fieldPosition without segmentName');
  if (segmentIteration && !segmentName)
    throw Error('Cannot have segmentIteration without segmentName');
  if (subComponentPosition !== undefined) path = `.${subComponentPosition}`;
  if (componentPosition !== undefined) path = `.${componentPosition}${path}`;
  if (fieldIteration !== undefined) path = `[${fieldIteration}]${path}`;
  if (fieldPosition !== undefined) path = `-${fieldPosition}${path}`;
  if (segmentIteration !== undefined) path = `[${segmentIteration}]${path}`;
  if (segmentName !== undefined) path = `${segmentName}${path}`;
  return path;
};
