import path from 'path';
import fs from 'fs';
// import { onLog, setLoggingConfig } from '../eventHandlers';

interface CacheOptions {
  base?: string;
  name?: string;
  duration?: number;
  memory?: boolean;
  persist?: boolean;
  verbose?: boolean;
}

const exists = (dir: string): boolean => {
  try {
    fs.accessSync(dir);
  } catch (err) {
    return false;
  }

  return true;
};

class cache<T> {
  private options: CacheOptions;
  private base: string;
  private cacheDir: string;
  private cacheInfinitely: boolean;
  private cacheDuration: number;
  constructor(options: CacheOptions = {}) {
    this.options = options;
    this.base = path.normalize(
      this.options.base || path.dirname('') + '/cache',
    );
    this.cacheDir = path.normalize(
      this.base + '/' + (this.options.name || 'cache'),
    );
    // setLoggingConfig({ console: options.verbose ?? false });
    // onLog.go({ cacheDir: this.cacheDir });
    this.cacheInfinitely = !(typeof this.options.duration === 'number');
    this.cacheDuration = this.options.duration ?? 0;
    if (!exists(this.cacheDir))
      fs.mkdirSync(this.cacheDir, { recursive: true });
  }
  private buildFilePath = (name: string) => {
    return path.normalize(this.cacheDir + '/' + name + '.json');
  };
  private buildCacheEntry = <D extends T = T>(data: D) => {
    return {
      cacheUntil: !this.cacheInfinitely
        ? new Date().getTime() + this.cacheDuration
        : undefined,
      data: data,
    };
  };
  public put = <D extends T = T>(name: string, data: D) => {
    return new Promise<D>((res, rej) => {
      fs.writeFile(
        this.buildFilePath(name),
        JSON.stringify(this.buildCacheEntry(data)),
        (err) => {
          if (err != null) {
            return rej(err);
          }
          return res(data);
        },
      );
    });
  };
  public putSync = <D extends T = T>(name: string, data: D) => {
    fs.writeFileSync(
      this.buildFilePath(name),
      JSON.stringify(this.buildCacheEntry(data)),
    );
    return data;
  };
  public get = <D extends T = T>(name: string): Promise<D | undefined> => {
    return new Promise((res, rej) => {
      fs.readFile(this.buildFilePath(name), 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') return res(undefined);
          return rej(err);
        }
        try {
          const parsed = JSON.parse(data);

          if (parsed.cacheUntil && new Date().getTime() > parsed.cacheUntil) {
            this.delete(name);
            return res(undefined);
          }

          return res(parsed.data);
        } catch (e) {
          rej(e);
        }
      });
    });
  };
  public getSync = <D extends T = T>(name: string): D | undefined => {
    let data: ReturnType<typeof JSON.parse> = undefined;
    const cacheFilePath = this.buildFilePath(name);
    try {
      data = JSON.parse(fs.readFileSync(cacheFilePath, { encoding: 'utf8' }));
    } catch (_e: unknown) {
      return undefined;
    }

    if (data.cacheUntil && new Date().getTime() > data.cacheUntil) {
      this.deleteEntrySync(name);
      return undefined;
    }
    return data.data;
  };
  public delete = (name: string) => {
    return new Promise<void>((res, rej) => {
      fs.unlink(this.buildFilePath(name), (err) => {
        if (err) return rej(err);
        return res();
      });
    });
  };
  public deleteEntrySync = (name: string) => {
    fs.unlinkSync(this.buildFilePath(name));
  };
}

export default cache;
