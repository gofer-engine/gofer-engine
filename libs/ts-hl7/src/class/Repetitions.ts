import { encodeSep } from '../encode/encodeSep'
import {
  Field,
  IRep,
  IfTrueElse,
  NoPos,
  StrictComponent,
  StrictFieldRepetition,
} from '../types'
import { Cmp } from './Component'

export class Rep implements IRep {
  private _rep: Field
  private _compSep = '^'
  private _subCompSep = '&'
  private _escChar = '\\'
  constructor(field: Field) {
    this._rep = field
  }

  public json = <S extends boolean | undefined = undefined>(
    strict?: S
  ): IfTrueElse<S, NoPos<StrictFieldRepetition>, Field> => {
    if (strict) {
      const rep: NoPos<StrictFieldRepetition> = {
        components: this.getComponents().map((c, i) => {
          const component: StrictComponent = {
            position: i + 1,
            ...c.json(true),
          }
          return component
        }),
        value: this.toString() ?? '',
      }
      return rep as IfTrueElse<S, NoPos<StrictFieldRepetition>, Field>
    }
    return this._rep as IfTrueElse<S, NoPos<StrictFieldRepetition>, Field>
  }

  public toString = ({
    compSep = this._compSep,
    subCompSep = this._subCompSep,
    escChar = this._escChar,
  } = {}) => {
    this._compSep = compSep
    this._subCompSep = subCompSep
    this._escChar = escChar
    return encodeSep(this._rep, compSep, (comp) => {
      return encodeSep(comp, subCompSep)
    }) as string
  }

  /**
   * get a component from a field
   * @param componentPosition 1-indexed component position to get. Defaults to 1.
   * @returns a Component Class or an array of Component Classes
   */
  public getComponent = (componentPosition = 1) => {
    if (this._rep === null) return new Cmp(null)
    if (!Array.isArray(this._rep)) {
      if (componentPosition === 1) {
        return new Cmp(this._rep)
      }
      return new Cmp(null)
    }
    return new Cmp(this._rep[componentPosition - 1] ?? null)
  }

  public getComponents = () => {
    if (Array.isArray(this._rep)) {
      return this._rep.map((c) => new Cmp(c))
    }
    return [new Cmp(this._rep)]
  }
}
