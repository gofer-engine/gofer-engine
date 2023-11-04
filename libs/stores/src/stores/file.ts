import fs from 'fs';
import { IMsg } from '@gofer-engine/message-type';
import { IStoreClass, StoreFunc, StoreOption } from '../types';
import { genId } from '@gofer-engine/tools';

/**
 * @param path - Accepts HL7 references like `['$PID-5[1].1', 'test', '$PID-3[1].1']`. Each element in array is a directory. Empty strings will be filtered out.
 * @param filename - Accepts HL7 references like `['$PID-5[1].1', '_', '$PID-3[1].1']`. For advanced configuration, you can provide a function that receives the message and returns the filename string.
 * @param extension - Include leading `.`
 */
export interface IDBStoreOptions extends StoreOption {
  path?: string[];
  format?: 'string' | 'json'; // TODO: support other formats?
  overwrite?: boolean;
  append?: boolean;
  autoCreateDir?: boolean;
  warnOnError?: boolean;
  extension?: string;
  filename?: string | string[] | ((msg: IMsg) => string);
}

class DBStore implements IStoreClass {
  private path: NonNullable<IDBStoreOptions['path']>;
  private overwrite: NonNullable<IDBStoreOptions['overwrite']>;
  private append: NonNullable<IDBStoreOptions['append']>;
  private autoCreateDir: NonNullable<IDBStoreOptions['autoCreateDir']>;
  private warnOnError: NonNullable<IDBStoreOptions['warnOnError']>;
  private filename: IDBStoreOptions['filename'];
  private extension: IDBStoreOptions['extension'];
  private format: IDBStoreOptions['format'];
  constructor({
    path = ['local'],
    overwrite = true,
    append = false,
    autoCreateDir = true,
    warnOnError = false,
    extension,
    format,
    filename,
  }: IDBStoreOptions = {}) {
    this.overwrite = overwrite;
    this.append = append;
    this.autoCreateDir = autoCreateDir;
    this.warnOnError = warnOnError;
    this.filename = filename;
    this.extension = extension;
    this.format = format;
    this.path = path;
  }
  public store: StoreFunc = async (data, context) => {
    const _format =
      this.format === undefined
        ? context.kind === 'HL7v2'
          ? 'string'
          : 'json'
        : this.format;
    const _extension =
      this.extension === undefined
        ? context.kind === 'HL7v2'
          ? '.hl7'
          : '.json'
        : this.extension;
    const _filename =
      this.filename === undefined
        ? context.kind === 'HL7v2'
          ? ['$MSH-10.1']
          : ['$id']
        : typeof this.filename === 'string'
        ? [this.filename]
        : this.filename;
    const dirname = this.path
      .map((p) => {
        if (p.charAt(0) === '$') {
          return data.get(p.slice(1))?.toString() ?? '';
        }
        return p;
      })
      .filter((p) => p !== '')
      .join('/');
    if (typeof this.filename === 'string') this.filename = [this.filename];
    let filename =
      typeof _filename === 'function'
        ? _filename(data)
        : _filename
            .map((n) => {
              if (n === 'UUID' || n === 'ID' || n === 'UID') {
                return genId(n);
              }
              if (context.kind === 'HL7v2') {
                if (n.match(/^\$[A-Z][A-Z0-9]{2}/)) {
                  const id = data.get(n.slice(1))
                  if (typeof id === 'number' && id !== 0 && !isNaN(id)) {
                    return id.toString();
                  }
                  if (typeof id === 'string' && id !== '') {
                    return id;
                  }
                  context.logger(`The HL7v2 path ${n} does not exist in the message, using UUID instead`, 'warn')
                  return genId('UUID');
                }
              }
              if (context.kind === 'JSON') {
                if (n.startsWith('$')) {
                  const id = data.get(n.slice(1))
                  if (typeof id === 'number' && id !== 0 && !isNaN(id)) {
                    return id.toString();
                  }
                  if (typeof id === 'string' && id !== '') {
                    return id;
                  }
                  context.logger(`The JSON path ${n} does not exist in the message, using UUID instead`, 'warn')
                  return genId('UUID');
                }
              }
              return n;
            })
            .join('');
    if (filename === '') {
      context.logger(`Compiled filename is empty, using UUID instead`, 'warn')
      filename = genId('UUID');
    }
    const fullPath = `${dirname}/${filename}${_extension}`;
    if (this.autoCreateDir && !fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    if (!this.overwrite && !this.append && fs.existsSync(fullPath)) {
      context.logger(
        `Options set to not overwrite and not append, but the file: ${fullPath} already exists`,
        this.warnOnError ? 'warn' : 'error',
      );
    }
    const contents = _format === 'string' ? data.toString() : data.json();
    return new Promise<boolean>((res, rej) => {
      fs.writeFile(
        fullPath,
        typeof contents !== 'string' ? JSON.stringify(contents, undefined, 2) : contents,
        { flag: this.append ? 'a' : 'w' },
        (err) => {
          if (err) {
            context.logger(
              JSON.stringify(err),
              this.warnOnError ? 'warn' : 'error',
            );
            this.warnOnError ? res(false) : rej(err);
          } else {
            context.logger(`file written to ${fullPath}`, 'debug');
            res(true);
          }
        },
      );
    });
  };
  public close = async () => {
    // nothing to do here for this store
  };
  /**
   * @param query - Accepts a file path or directory path
   * @returns - Returns the contents of the file or an array of file contents
   */
  public query = async (query: string): Promise<null | string | string[]> => {
    const path = fs.lstatSync(query);

    // if query is a directory path, return the contens of the files in an array
    if (path.isDirectory()) {
      const files = fs.readdirSync(query);
      return files.map((file) => fs.readFileSync(`${query}/${file}`, 'utf8'));
      // if query is a file path, read the file and return the contents
    } else if (path.isFile()) {
      return fs.readFileSync(query, 'utf8');
    } else {
      return null;
    }
  };
}

export default DBStore;
