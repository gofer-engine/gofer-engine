import { IMultiSubs, ISub, ISubs, IfTrueElse, NoPos, StrictSubComponent, SubComponent } from '../types'

export class Sub implements ISub {
  private _sub: SubComponent
  constructor(subComponent: SubComponent) {
    this._sub = subComponent
  }

  public json = <S extends boolean | undefined = undefined>(
    strict?: S
  ): IfTrueElse<S, NoPos<StrictSubComponent>, SubComponent> => {
    if (strict) {
      const sub: NoPos<StrictSubComponent> = {
        value: this._sub ?? '',
      }
      return sub as IfTrueElse<S, NoPos<StrictSubComponent>, SubComponent>
    }
    return this._sub as IfTrueElse<S, NoPos<StrictSubComponent>, SubComponent>
  }

  public toString = () => this._sub ?? ''
}

export class Subs implements ISubs {
  private _subs: SubComponent[]
  constructor(subComponents: SubComponent[]) {
    this._subs = subComponents
  }

  public json = <S extends boolean | undefined = undefined>(
    strict?: S
  ): IfTrueElse<S, StrictSubComponent[], SubComponent[]> => {
    if (strict) {
      const sub: StrictSubComponent[] = this._subs.map((sub, i) => {
        const subComponent: StrictSubComponent = {
          position: i + 1,
          value: sub ?? '',
        }
        return subComponent
      })
      return sub as IfTrueElse<S, StrictSubComponent[], SubComponent[]>
    }
    return this._subs as IfTrueElse<S, StrictSubComponent[], SubComponent[]>
  }

  public toString = (subCompSep = '&') => {
    return this._subs.join(subCompSep)
  }
}

export class MultiSubs implements IMultiSubs {
  private _subs: Sub[][]
  constructor(subComponents: Sub[][]) {
    this._subs = subComponents
  }

  public toString = (subCompSep = '&', compSep = '^') => {
    return this._subs
      .map((sub) => sub.map((s) => s.toString()).join(subCompSep))
      .join(compSep)
  }

  public json = () => {
    return this._subs.map((sub) => sub.map((s) => s.json()))
  }
}
