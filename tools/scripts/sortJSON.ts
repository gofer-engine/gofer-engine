/* eslint-disable @typescript-eslint/no-explicit-any */
const NON_SORTABLE_TYPES = [
  'undefined',
  'string',
  'number',
  'boolean',
  'function',
];
type SortifyOptions = {
  sortBy?: any;
  sortKey?: boolean;
  sortArray?: boolean;
  stringify?: boolean;
  replacer?: any;
  space?: number | string;
};
const DEFAULT_SORT_OPTIONS: SortifyOptions = {
  sortBy: undefined,
  sortKey: true,
  sortArray: false,
  stringify: true,
  replacer: null,
  space: 2,
};

const _sortify = function (obj: any, options: SortifyOptions) {
  for (let i = 0; i < NON_SORTABLE_TYPES.length; i++) {
    if (NON_SORTABLE_TYPES[i] === typeof obj || obj === null) {
      return obj;
    }
  }

  if (Array.isArray(obj)) {
    if (options.sortArray === true) {
      obj.sort(options.sortBy);
    }

    for (let i = 0; i < obj.length; i++) {
      obj[i] = _sortify(obj[i], options);
    }

    return obj;
  } else {
    if (options.sortKey === true) {
      const sortedObj: Record<string, any> = {};
      const keyList: any[] = [];

      for (const k in obj) {
        keyList.push(k);
      }
      keyList.sort(options.sortBy);

      for (let i = 0; i < keyList.length; i++) {
        const k = keyList[i];
        const v = obj[k];

        sortedObj[k] = _sortify(v, options);
      }

      return sortedObj;
    } else {
      for (const k in obj) {
        obj[k] = _sortify(obj[k], options);
      }

      return obj;
    }
  }
};

const sortify = function (obj: any, options: SortifyOptions = {}) {
  const opts: SortifyOptions = {
    ...DEFAULT_SORT_OPTIONS,
    ...options,
  };

  let result = _sortify(obj, opts);
  if (opts.stringify === true) {
    result = JSON.stringify(result, opts.replacer, opts.space);
  }

  return result;
};

export default sortify;
