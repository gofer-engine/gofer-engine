import { deepCopy } from '../encode/deepCopy';
import { encodeRep } from '../encode/encodeRep';
import { encodeSep } from '../encode/encodeSep';
import {
  Component,
  Field,
  FieldRep,
  ICmp,
  IFld,
  IFlds,
  IRep,
  IfTrueElse,
  NoPos,
  StrictField,
} from '../types';
import { Cmp, Cmps } from './Component';
import { Rep } from './Repetitions';

export class Fld implements IFld {
  private _fld: Field | FieldRep;
  private _compSep = '^';
  private _subCompSep = '&';
  private _repSep = '~';
  private _escChar = '\\';
  constructor(field: Field | FieldRep) {
    this._fld = field;
  }

  public json = <S extends boolean | undefined = undefined>(
    strict?: S,
  ): IfTrueElse<S, NoPos<StrictField>, Field | FieldRep> => {
    if (strict) {
      const field: NoPos<StrictField> = {
        value: this.toString() ?? '',
        repetitions: this.getRepetitions().map((rep, i) => {
          return {
            position: i + 1,
            ...rep.json(true),
          };
        }),
      };
      return field as IfTrueElse<S, NoPos<StrictField>, Field | FieldRep>;
    }
    return this._fld as IfTrueElse<S, NoPos<StrictField>, Field | FieldRep>;
  };

  public toString = ({
    compSep = this._compSep,
    subCompSep = this._subCompSep,
    repSep = this._repSep,
    escChar = this._escChar,
  } = {}) => {
    this._compSep = compSep;
    this._subCompSep = subCompSep;
    this._repSep = repSep;
    this._escChar = escChar;
    const fld = deepCopy(this._fld);
    return encodeRep(fld, repSep, (rep) => {
      return encodeSep(rep, compSep, (comp) => {
        return encodeSep(comp, subCompSep);
      });
    }) as string;
  };

  /**
   * split possible field repetitions into an array of singular separation field classes.
   */
  public getRepetitions = (): IRep[] => {
    if (
      Array.isArray(this._fld) &&
      this._fld.length > 1 &&
      typeof this._fld[0] === 'object' &&
      Object.prototype.hasOwnProperty.call(this._fld[0] || {}, 'rep')
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_rep, ...fields] = this._fld;
      return fields.map((f) => new Rep(f as Field));
    }
    return [new Rep(this._fld as Field)];
  };

  /**
   * get a component from a field
   * @param componentPosition 1-indexed component position to get. Defaults to 1.
   * @returns a Component Class or an array of Component Classes
   */
  public getComponent = (
    componentPosition: number | undefined = 1,
  ): Cmp | Cmps => {
    if (this._fld === null) return new Cmp(null);
    if (!Array.isArray(this._fld)) {
      if (componentPosition === undefined || componentPosition === 1)
        return new Cmp(this._fld);
      return new Cmp(null);
    }
    if (this._fld.length === 0) return new Cmp(null);
    if (
      typeof this._fld[0] === 'object' &&
      Object.prototype.hasOwnProperty.call(this._fld[0] || {}, 'rep')
    ) {
      const [, ...fields] = this._fld as FieldRep;
      return new Cmps(
        fields.map((field) => new Cmp(field?.[componentPosition - 1] ?? null)),
      );
    }
    return new Cmp((this._fld as Component[])?.[componentPosition - 1] ?? null);
  };

  public getComponents = () => {
    if (Array.isArray(this._fld)) {
      if (
        this._fld.length > 1 &&
        typeof this._fld[0] === 'object' &&
        Object.prototype.hasOwnProperty.call(this._fld[0] || {}, 'rep')
      ) {
        const comps: Cmp[] = [];
        const [, ...fields] = this._fld as FieldRep;
        fields.forEach((field) => {
          comps.push(...new Fld(field).getComponents());
        });
        return comps;
      }
      return this._fld.map((f) => new Cmp(f as Component));
    }
    return [new Cmp(this._fld)];
  };
}

export class Flds implements IFlds {
  private _flds: IFld[];

  constructor(fields: IFld[]) {
    this._flds = fields;
  }

  public json = <S extends boolean | undefined = undefined>(
    strict?: S,
  ): IfTrueElse<S, StrictField[], Field[]> => {
    if (strict) {
      const strictField: StrictField[] = this._flds.map((f, i) => {
        return {
          position: i + 1,
          ...f.json(true),
        };
      });
      return strictField as IfTrueElse<S, StrictField[], Field[]>;
    }
    return this._flds.map((f) => f.json()) as IfTrueElse<
      S,
      StrictField[],
      Field[]
    >;
  };

  public one = () => this._flds[0];

  public toString = ({
    fieldSep = '|',
    compSep = '^',
    subCompSep = '&',
    repSep = '~',
    escChar = '\\',
  } = {}) => {
    return this._flds
      .map((f) => f.toString({ compSep, subCompSep, repSep, escChar }))
      .join(fieldSep);
  };

  public getComponent = (componentPosition = 1) => {
    if (this._flds.length === 0) return new Cmp(null);
    if (this._flds.length === 1) return this._flds[0].getComponent(1);
    const comps = this._flds.map((f) => f.getComponent(componentPosition));
    const cmps: ICmp[] = [];
    comps.forEach((c) => {
      if (c instanceof Cmp) {
        cmps.push(c);
      } else {
        cmps.push(...c.all());
      }
    });
    return new Cmps(cmps);
  };

  public getComponents = () => {
    if (this._flds.length === 0) return new Cmps([]);
    if (this._flds.length === 1) return new Cmps(this._flds[0].getComponents());
    const cmps: ICmp[] = [];
    this._flds.forEach((f) => {
      cmps.push(...f.getComponents());
    });
    return new Cmps(cmps);
  };
}
