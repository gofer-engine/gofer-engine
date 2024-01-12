export const parseXMLPath = (path: string, depth = 0): (string | number)[] => {
  // FIXME: the `.` is not handled correctly. It should be a reference to the current node.
  // `/root/element` selects `element` from the root node
  // `./element` selects `element` from the current node
  // This will be a little tricky to implement since we will need to keep the root
  // in the context for reference during each iteration of the path.
  // This ^^ is really meant for the `getXML` function, not the `parseXMLPath` function.
  // console.log({ path, depth })
  if (path === '') {
    return [];
  }
  depth++;
  const ogPath = path;
  if (path.startsWith('//')) {
    return ['//', ...parseXMLPath(path.slice(2), depth)]; 
  }
  if (path.startsWith('[')) {
    path = path.slice(1);
    const matched = path.match(/^(\d+)\]/) ?? [];
    // console.log(matched)
    if (matched.length > 1) {

      const [substr, i] = matched
      const index = parseInt(i)
      if (index === undefined) {
        throw new Error('Invalid path');
      }
      const rest = path.replace(substr, '');
      if (rest === '') {
        return [index];
      }
      return [index, ...parseXMLPath(rest, depth)];
    }
    if (path.startsWith('*]')) {
      const rest = path.replace('*]', '');
      return ['*', ...parseXMLPath(rest, depth)];
    }
    const keyMatch = path.match(/^([^\]]+)]/)
    // console.log({ path, keyMatch })
    if (keyMatch.length) {
      const [substr, key] = keyMatch
      const rest = path.replace(substr, '');
      if (rest === '') {
        return [key];
      }
      return [key, ...parseXMLPath(rest, depth)];
    }
  } else if (path.startsWith('@')) {
    path = path.slice(1);
    const first = path.match(/^[^@.[/]+/)?.[0];
    const rest = path.replace(first, '');
    const attr = `@${first}`
    // console.log({ path, first, rest, attr })
    if (rest === '') {
      return [attr];
    }
    return [attr, ...parseXMLPath(rest, depth)];
  }
  if (path.startsWith('/') && !path.startsWith('//')) {
    path = path.slice(1);
  }
  if (path.startsWith('.')) {
    path = path.slice(1);
  }
  const prependAt = path.startsWith('@');
  if (prependAt) {
    path = path.slice(1);
  }
  let first = path.match(/^[^@.[/]+/)?.[0];
  const rest = path.replace(first, '');
  if (prependAt) {
    first = `@${first}`;
  }
  if (rest === '') {
    return [first];
  }
  if (rest === ogPath) {
    throw new Error('Invalid path');
  }
  return [first, ...parseXMLPath(rest, depth)];
};
