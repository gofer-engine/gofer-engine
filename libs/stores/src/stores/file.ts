import { randomUUID } from 'crypto'
import fs from 'fs'
import Msg from '@gofer-engine/ts-hl7'
import { IStoreClass, StoreFunc, StoreOption } from '../types'

/**
 * @param path - Accepts HL7 references like `['$PID-5[1].1', 'test', '$PID-3[1].1']`. Each element in array is a directory. Empty strings will be filtered out.
 * @param filename - Accepts HL7 references like `['$PID-5[1].1', '_', '$PID-3[1].1']`. For advanced configuration, you can provide a function that receives the message and returns the filename string.
 * @param extension - Include leading `.`
 */
export interface IDBStoreOptions extends StoreOption {
  path?: string[]
  format?: 'string' | 'json' // TODO: support other formats?
  overwrite?: boolean
  append?: boolean
  autoCreateDir?: boolean
  warnOnError?: boolean
  extension?: string
  filename?: string | string[] | ((msg: Msg) => string)
  verbose?: boolean
}

class DBStore implements IStoreClass {
  private path: NonNullable<IDBStoreOptions['path']>
  private overwrite: NonNullable<IDBStoreOptions['overwrite']>
  private append: NonNullable<IDBStoreOptions['append']>
  private autoCreateDir: NonNullable<IDBStoreOptions['autoCreateDir']>
  private warnOnError: NonNullable<IDBStoreOptions['warnOnError']>
  private filename: NonNullable<IDBStoreOptions['filename']>
  private extension: NonNullable<IDBStoreOptions['extension']>
  private format: NonNullable<IDBStoreOptions['format']>
  private verbose: NonNullable<IDBStoreOptions['verbose']>
  constructor({
    path = ['local'],
    overwrite = true,
    append = false,
    autoCreateDir = true,
    warnOnError = false,
    extension = '.hl7',
    format = 'string',
    filename = '$MSH-10.1',
    verbose = false,
  }: IDBStoreOptions = {}) {
    this.overwrite = overwrite
    this.append = append
    this.autoCreateDir = autoCreateDir
    this.warnOnError = warnOnError
    this.filename = filename
    this.extension = extension
    this.format = format
    this.path = path
    this.verbose = verbose
  }
  public store: StoreFunc = async (data) => {
    const dirname = this.path
      .map((p) => {
        if (p.charAt(0) === '$') {
          return data.get(p.slice(1))?.toString() ?? ''
        }
        return p
      })
      .filter((p) => p !== '')
      .join('/')
    if (typeof this.filename === 'string') this.filename = [this.filename]
    const filename =
      typeof this.filename === 'function'
        ? this.filename(data)
        : this.filename
            .map((n) => {
              return n === 'UUID'
                ? randomUUID()
                : n.match(/^\$[A-Z][A-Z0-9]{2}/)
                ? ((data.get(n.slice(1)) ?? '') as string)
                : n
            })
            .join('')
    const fullPath = `${dirname}/${filename}${this.extension}`
    if (this.autoCreateDir && !fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true })
    }
    if (!this.overwrite && !this.append && fs.existsSync(fullPath)) {
      if (this.warnOnError) {
        console.warn(
          `Options set to not overwrite and not append, but the file: ${fullPath} already exists`
        )
      } else {
        throw new Error(
          `Options set to not overwrite and not append, but the file: ${fullPath} already exists`
        )
      }
    }
    const contents =
      this.format === 'string' ? data.toString() : JSON.stringify(data.json())
    return new Promise<boolean>((res, rej) => {
      fs.writeFile(
        fullPath,
        contents,
        { flag: this.append ? 'a' : 'w' },
        (err) => {
          if (err) {
            if (this.warnOnError) {
              console.warn(err)
              res(false)
            } else {
              console.error(err)
              rej(err)
            }
          } else {
            if (this.verbose) console.log(`file written to ${fullPath}`)
            res(true)
          }
        }
      )
    })
  }
  public close = async () => {
    // nothing to do here for this store
  }
  /**
   * @param query - Accepts a file path or directory path
   * @returns - Returns the contents of the file or an array of file contents 
   */
  public query = async (query: string): Promise<null | string | string[]> => {
    const path = fs.lstatSync(query)

    // if query is a directory path, return the contens of the files in an array
    if (path.isDirectory()) {
      const files = fs.readdirSync(query)
      return files.map(file => fs.readFileSync(`${query}/${file}`, 'utf8'))
    // if query is a file path, read the file and return the contents
    } else if (path.isFile()) {
      return fs.readFileSync(query, 'utf8')
    } else {
      return null
    }
  }
}

export default DBStore
