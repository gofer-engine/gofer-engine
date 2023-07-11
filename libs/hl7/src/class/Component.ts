import { encodeSep } from '../encode/encodeSep';
import {
  Component,
  ICmp,
  ICmps,
  ISub,
  IfTrueElse,
  NoPos,
  StrictComponent,
  StrictSubComponent,
} from '../types';
import { Sub, Subs } from './SubComponent';

export class Cmp implements ICmp {
  private _cmp: Component;
  private _subCompSep = '&';
  constructor(component: Component) {
    this._cmp = component;
  }

  /**
   * @deprecated replace with `json()`
   */
  public raw = () => this._cmp;

  public json = <S extends boolean | undefined = undefined>(
    strict?: S
  ): IfTrueElse<S, NoPos<StrictComponent>, Component> => {
    if (strict) {
      const comp: NoPos<StrictComponent> = {
        value: this.toString() ?? '',
        subComponents: this.getSubComponents().map((s, i) => {
          const subComponent: StrictSubComponent = {
            position: i + 1,
            ...s.json(true),
          };
          return subComponent;
        }),
      };
      // FIXME: finish this instead of returning null
      return comp as IfTrueElse<S, NoPos<StrictComponent>, Component>;
    }
    return this._cmp as IfTrueElse<S, NoPos<StrictComponent>, Component>;
  };

  public one = () => this;
  public all = () => [this];
  public toString = ({ subCompSep = this._subCompSep } = {}): string => {
    this._subCompSep = subCompSep;
    return encodeSep(this._cmp, subCompSep) as string;
  };

  public getSubComponent = (subComponentPosition: number | undefined = 1) => {
    if (this._cmp === null) return new Sub(null);
    if (Array.isArray(this._cmp)) {
      return new Sub(this._cmp[subComponentPosition - 1] ?? null);
    } else if (subComponentPosition > 1) return new Sub(null);
    return new Sub(this._cmp);
  };

  public getSubComponents = (): ISub[] => {
    if (this._cmp === null) return [new Sub(null)];
    if (Array.isArray(this._cmp)) {
      return this._cmp.map((sub) => new Sub(sub));
    }
    return [new Sub(this._cmp)];
  };
}

export class Cmps implements ICmps {
  private _cmps: ICmp[];
  private _subCompSep = '&';
  private _fieldRepSep = '~';
  constructor(components: ICmp[]) {
    this._cmps = components;
  }
  public json = <S extends boolean | undefined = undefined>(
    strict?: S
  ): IfTrueElse<S, StrictComponent[], Component[]> => {
    if (strict) {
      const strictComponent: StrictComponent[] = this._cmps.map((c, i) => {
        return {
          position: i + 1,
          ...c.json(true),
        };
      });
      return strictComponent as IfTrueElse<S, StrictComponent[], Component[]>;
    }
    return this._cmps.map((c) => c.json()) as IfTrueElse<
      S,
      StrictComponent[],
      Component[]
    >;
  };

  /**
   * In case where the field is a repeating field, this will `one` function gets only one of the fields
   * @param iteration 1-indexed repeating field component to use. Defaults to 1.
   * @returns a singular Component Class
   */
  public one = (iteration = 1) => this._cmps[iteration - 1] ?? new Cmp(null);
  public all = () => this._cmps;

  public toString = (
    { subCompSep = this._subCompSep, fieldRepSep = this._fieldRepSep } = {},
    stringify = false
  ) => {
    this._subCompSep = subCompSep;
    this._fieldRepSep = fieldRepSep;
    const strings = this._cmps.map((c) => c.toString({ subCompSep }));
    if (stringify) return strings.join(fieldRepSep);
    return strings;
  };

  public getSubComponent = (
    subComponentPosition: number | undefined = 1
  ): Subs => {
    return new Subs(
      this._cmps.map((c) => c.getSubComponent(subComponentPosition).json())
    );
  };

  public getSubComponents = () => {
    return this._cmps.map((c) => c.getSubComponents());
  };
}
