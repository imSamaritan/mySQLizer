export const _cloneMethodSymbol = Symbol()
export const _throwErrorMethodSymbol = Symbol()
export const _setTable = Symbol()

export default class Helper {
  static castValue(value, type) {
    let castedValue

    switch (type) {
      case 'string':
        castedValue = value.toString()
        break
      case 'number':
        castedValue = Number(value)
        if (isNaN(castedValue)) throw new Error(`Cannot cast '${value}' to number`)
        break
      case 'boolean':
        castedValue = Boolean(value)
        break
      default:
        castedValue = value
        break
    }

    return castedValue
  }
}

