import { Element } from 'xml-js'

const filterElements = (name: string) => (item: string): boolean => {
  if (name === '*') {
    return true;
  }
  // add support to match namespaces with either single or double colon
  if (name.indexOf('::')) {
    name = name.replace(/::/g, ':')
  }
  if (item === name) {
    return true;
  }
  // add support to match namespaced elements with a wildcard prefix.
  if (name.startsWith('*:')) {
    if (item.split(':').slice(1).join(':') === name.slice(2)) {
      return true;
    }
  }
  // add support to match all elements of a namespace
  if (name.endsWith(':*')) {
    if (item.indexOf(':')) {
      if (item.split(':').slice(0, -1).join(':') === name.split(':').slice(0, -1).join(':')) {
        return true;
      }
    } else {
      return true;
    }
  }
  // add support to match namespaced elements without giving a prefix,
  // i.e get all elements no matter the namespace prefix
  if (item?.split?.(':')?.slice?.(1)?.join?.(':') === name) {
    return true;
  }
  return false;
}

const Value = (value: unknown): string | number | boolean => {
  switch(typeof value) {
    case 'string': {
      if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        return Boolean(value);
      }
      const numericValue = Number(value);
      if (!isNaN(numericValue)) {
        return numericValue;
      }
      return value;
    }
    case 'number':
      return value;
    case 'boolean':
      return value;
    case 'bigint':
    case 'symbol':
    case 'object':
      if (value === null) {
        return '';
      }
      return value.toString();
    case 'undefined':
      return '';
    case 'function':
    default:
      throw new Error(`unexpected ${typeof value} value`);
  }
}

export const flattenXML = (xml: Element): Element[] => {
  if (xml.elements?.length) {
    return [
      ...xml.elements,
      ...xml.elements.map(flattenXML).flat(),
    ]
  }
  return [];
}

export const getJson = (
  xml: Element,
  path: (string | number)[]
): Element => {
  // console.log({ path, xml: JSON.stringify(xml, null, 2) })
  // to prevent parralel instances of modifying the same path, we clone the path
  path = [...path]
  // short circuit if path is empty or xml is empty
  if (!path.length || !Object.keys(xml).length) {
    // console.log({ xml })
    return xml;
  }
  // placeholder for the picked xml
  let picked: Element;
  const current = path.shift();
  const next = path?.[0];
  // path start with //, create a flat list of all elements but keep the hierarchy under
  if (current === '//') {
    if (next === undefined) {
      throw new Error('Invalid path "//"');
    }
    const elements = flattenXML(xml).filter(e => e.type === 'element');
    picked = getJson({ elements }, path);
    // console.log(JSON.stringify(picked))
  }
  // path starts with @, we are looking for an attribute
  else if (typeof current === 'string' && current.startsWith('@')) {
    const key = current.slice(1);
    if (!key) {
      throw new Error('Invalid path "@"');
    }
    const attributes = xml?.attributes ?? xml?.declaration?.attributes ?? {};
    const values = Object.entries(attributes).filter(([k]) => filterElements(key)(k));
    // console.log({ values })
    picked = {
      type: 'element',
      name: 'attributes',
      // attributes: Object.fromEntries(values),
      elements: values.map(([name, value]) => ({ type: 'text', name, text: Value(value) }))
    };

  } else if (typeof current === 'number') {
    // xPath is 1 based, so we need to subtract 1 from the index
    picked = getJson(xml.elements?.[current-1], path);
  } else if (typeof current === 'string') {
    const list = xml.elements?.filter(e => filterElements(current)(e.name));
    if (!list.length) {
      picked = {};
    } else if (list.length === 1) {
      picked = getJson(list[0], path);
    } else if (typeof next === 'number') {
      // xPath is 1 based, so we need to subtract 1 from the index
      picked = getJson(list[next-1], path.slice(1));
    } else if (next === '*') {
      picked = { type: 'list', elements: list.map(e => getJson(e, path.slice(1))) };
    } else {
      picked = { elements: list };
      // picked = { elements: list.map(e => getXML(e, path)) };
    }
  }
  // console.log({ picked })
  return picked;
};