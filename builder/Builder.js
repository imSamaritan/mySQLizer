import Helper, {
  _cloneMethodSymbol as _clone,
  _throwErrorMethodSymbol as _throwError,
} from '../helper/Helper.js'
const _null = Symbol()
const _between = Symbol()
const _inOrNotIn = Symbol()

class Builder {
  // ---IMPLEMENTATION DETAILS ---//
  /**
   * @param {string} column
   * @param {string} operator
   * @param {string|number|boolean|object} value
   * @param {string} logicOperaor
   * @param {string} method
   * @return {Builder}
   */
  #andOr(column, operator, value, logicOperaor, method) {
    const { query, values } = this.state
    const queryLastPart = query[query.length - 1]
    let whereMethodNotUsed = !query.join('').includes('WHERE')

    if (queryLastPart === 'AND' || queryLastPart === 'OR') {
      this[_throwError](
        `"${method}" method can not be called after and()/or() method operator!`,
      )
    }

    if (whereMethodNotUsed) {
      this[_throwError](
        `"${method}" method must be chained after the "where" method!`,
      )
    }

    const state = { query: [...query, logicOperaor], values: [...values] }
    const orWhereInstance = this[_clone](state, true)

    const builder = orWhereInstance.where(column, operator, value)
    return builder
  }

  /**
   * @param {Closure} callback
   * @param {string} logicOperaor
   * @returns {Builder}
   */
  #group(callback, logicOperaor) {
    const { query, values } = this.state

    const builder = this[_clone](
      { query: [...query, logicOperaor], values: [...values] },
      true,
    )
    return callback(builder)
  }

  /**@param {string} column
   * @param {Array} list
   * @param {'NOT IN'|'IN'} operator
   * @return {Builder} */
  #inOrNotIn(column, list, operator) {
    let state = { query: [], values: [] }
    const { query, values } = this.state

    if (typeof column != 'string' || column === '')
      this[_throwError]('Column should be string and not empty!')

    if (!Array.isArray(list) || list.length < 1)
      this[_throwError]('List should be an array type and not empty!')

    const placeholders = list.map((value) => '?').join(',')

    if (this.operatorSignal)
      state = {
        query: [...query, `${column} ${operator}(${placeholders})`],
        values: [...values, ...list],
      }
    else
      state = {
        query: [...query, `WHERE ${column} ${operator}(${placeholders})`],
        values: [...values, ...list],
      }

    return this[_clone](state, true)
  }

  /** @param {string} operator @returns {Builder} */
  [_null](operator) {
    const { query, values } = this.state
    const state = { query: [], values: [] }

    state.query = [...query, operator]
    state.values = [...values]

    return this[_clone](state)
  }
  /**
   *
   * @param {number} start
   * @param {number} end
   * @param {string} operation
   * @returns {Builder}
   */
  [_between](start, end, operation) {
    const { query, values } = this.state
    const state = { query: [], values: [] }

    if (typeof start != 'number' || typeof end != 'number')
      this[_throwError](
        '"start" & "end" argument are required and must be of type number!',
      )

    state.query = [...query, operation]
    state.values = [...values, start, end]

    return this[_clone](state)
  }

  /**
   * @param {Array} list
   * @param {string} operator
   * @returns {Builder} */
  [_inOrNotIn](list, operator) {
    const { query, values } = this.state

    if (!Array.isArray(list) || list.length < 1)
      this[_throwError]('List should be an array type and not empty!')

    const placeholders = list.map(() => '?').join(',')

    return this[_clone]({
      query: [...query, `${operator}(${placeholders})`],
      values: [...values, ...list],
    })
  }

  // ---PUBLIC API IMPLEMENTATION DETAILS ---//

  /** @param {string[]} columns @return {this} */
  select(...columns) {
    const { query } = this.state
    const state = { query: [], values: [] }

    if (arguments.length === 0) {
      state.query = ['SELECT', ...query]
    } else {
      if (columns.length < 1) this[_throwError]('Column or columns, required!')

      if (
        columns.includes('') ||
        columns.includes(null) ||
        columns.includes(undefined)
      )
        this[_throwError](
          "List of columns can't include [empty, null or undefined] column(s) name(s)!",
        )

      state.query = [`SELECT ${columns.join(', ')}`, ...query]
    }

    return this[_clone](state, false)
  }
  /**
   *
   * @param  {string[]} columns
   * @returns {this}
   */
  distinct(...columns) {
    const { query } = this.state
    const state = { query: [], values: [] }

    if (columns.length < 1) this[_throwError]('Column or columns, required!')

    if (
      columns.includes('') ||
      columns.includes(null) ||
      columns.includes(undefined)
    )
      this[_throwError](
        "Column or a list of columns can't include [empty, null or undefined] column(s) name(s)!",
      )

    state.query = [...query, `DISTINCT ${columns.join(', ')}`]
    return this[_clone](state)
  }

  /** @return {this}*/
  selectAll() {
    if (arguments.length > 0)
      this[_throwError]('selectAll method takes none or 0 arguments!')
    return this.select('*')
  }

  /**
   *
   * @param {string} table
   * @returns {this}
   */
  from(table) {
    const { query, values } = this.state
    return this[_clone]({
      query: [...query, `FROM ${table}`],
      values: [...values],
    })
  }

  /**
   *
   * @param {string} table
   * @returns {this}
   */
  fromTable(table) {
    const { query, values } = this.state
    if (query.length > 0)
      this[_throwError](
        '[fromTable] method is an alternative to [setTable] method and also it should be first on the chain e.g postsModel.fromTable()',
      )

    return this[_clone]({
      query: [...query, `FROM ${table}`],
      values: [...values],
    })
  }

  /**
   * @param {object} details
   * @returns {this}
   */
  insert(details) {
    const { query } = this.state
    const values = []

    if (details === undefined || details === null)
      this[_throwError](
        '[Insert] method argument can not be null or undefined!',
      )

    if (Array.isArray(details) || typeof details != 'object')
      this[_throwError](
        '[Insert] method must take in a none empty object type e.g {column: value, ...}!',
      )

    if (query.length > 0)
      this[_throwError](
        '[Insert] method can not be chained after another query builder method!',
      )

    const keys = Object.keys(details)

    if (keys.length < 1)
      this[_throwError](
        '[Insert] method requires none empty object as its argument!',
      )

    for (const key of keys) values.push(details[key])

    return this[_clone]({ query: [`INSERT`], values: [...values], keys })
  }

  /**
   * @param {string} table
   * @returns {this}
   */
  into(table) {
    const { query, values, keys } = this.state
    const state = { query: [], values: [...values] }
    const queryLastPart = query[query.length - 1]
    const valuesPlaceholders = keys.map(() => `?`)

    if (queryLastPart.startsWith('INSERT')) {
      state.query = [
        ...query,
        `INTO ${table}(${keys.join(', ')}) VALUES(${valuesPlaceholders.join(', ')})`,
      ]
    } else {
      this[_throwError](
        '[into] method should always chained after [insert] method!',
      )
    }

    return this[_clone](state)
  }

  /**
   * @returns {this}
   */
  update() {
    const { query } = this.state

    if (query.length > 0) {
      this[_throwError]('[update] must comes first on the query chain!')
    }

    return this[_clone]({ query: ['UPDATE'], values: [] })
  }
  /**
   * @param {object} details
   * @returns {this}
   */
  set(details) {
    const { query } = this.state
    const values = []

    if (details === undefined || details === null)
      this[_throwError]('[set] method argument can not be null or undefined!')

    if (Array.isArray(details) || typeof details != 'object')
      this[_throwError](
        '[set] method must take in a none empty object type e.g {column: value, ...}!',
      )

    const keys = Object.keys(details)
    const columns = keys.map((key) => `${key} = ?`)

    if (keys.length < 1)
      this[_throwError](
        '[set] method requires none empty object as its argument!',
      )

    for (const key of keys) values.push(details[key])

    return this[_clone]({
      query: [...query, `SET ${columns.join(', ')}`],
      values: [...values],
    })
  }

  /**
   * @returns {this}
   */

  delete() {
    const { query, values } = this.state
    const state = { query: [], values: [...values] }

    if (query.length < 1) state.query = [`DELETE`]
    if (query.length > 0) state.query = [`DELETE`, ...query]

    return this[_clone](state)
  }

  /**
   * @returns {this}
   */
  countRecords() {
    const { query, values } = this.state
    const state = { query: [], values: [...values] }

    if (arguments.length > 0)
      this[_throwError]('[countRecords] method takes 0 arguments!')

    state.query = [`SELECT COUNT(*) AS recordsCount`, ...query]
    return this[_clone](state)
  }

  /**@param {number} limitTo
   * @returns {this}
   */
  limit(limitTo) {
    const { query, values } = this.state
    const state = { query: [], values: [] }

    if (typeof limitTo != 'number')
      this[_throwError]('[limit] requires 1 argument of type number!')

    if (query.length < 1)
      this[_throwError]('[limit] can not be chained at top level of the chain')

    state.query = [...query, `LIMIT ?`]
    state.values = [...values, limitTo]

    return this[_clone](this.state)
  }

  /**@param {number} offsetFrom
   * @returns {this}
   */
  offset(offsetFrom) {
    const { query, values } = this.state
    const state = { query: [], values: [] }

    if (typeof offsetFrom != 'number')
      this[_throwError]('[offset] requires 1 argument of type number!')

    if (query.length < 1)
      this[_throwError]('[offset] can not be chained at top level of the chain')

    if (!query[query.length - 1].includes('LIMIT'))
      this[_throwError](
        '[offset] method must be chained after [limit] method claus',
      )

    state.query = [...query, `OFFSET ?`]
    state.values = [...values, offsetFrom]

    return this[_clone](state)
  }
  /**
   * @returns {this}
   */
  orderBy(...sort) {
    const { query, values } = this.state
    const orderByState = []

    for (const sortElement of sort) {
      if (typeof sortElement === 'string') {
        orderByState.push(`${sortElement} ASC`)
      }

      if (typeof sortElement === 'object' && sortElement instanceof Object) {
        const columns = Object.keys(sortElement)

        for (const column of columns) {
          const direction = sortElement[column]
          orderByState.push(`${column} ${direction.toUpperCase()}`)
        }
      }
    }

    const state = {
      query: [...query, 'ORDER BY', orderByState.join(', ')],
      values: [...values],
    }
    return this[_clone](state)
  }
  /**
  @param {string} column
  @param {string} operator
  @param {boolean|number|string|object} value
  @return {this}*/
  where(column, operator, value) {
    let stateValue
    let state = { query: [], values: [] }
    const argumentsCount = arguments.length
    const { query, values } = this.state
    const supportedOperators = [
      '=',
      '!=',
      '<>',
      '>',
      '>=',
      '<',
      '<=',
      'LIKE',
      'NOT LIKE',
    ]
    const notSupportedOperators = [
      'IS NULL',
      'IS NOT NULL',
      'IN',
      'NOT IN',
      'BETWEEN',
      'NOT BETWEEN',
    ]

    if (query.length > 1) {
      if (query[query.length - 1].includes('WHERE')) {
        this[_throwError](
          '"Where" method can not be chain after another one, consider using the following methods after where (or(), and(), orWhere(), andWhere(), orGroup(cb), andGroup(cb)',
        )
      }
    }

    operator = operator.toUpperCase()

    const columnIsNotStringOrEmpty =
      !(typeof column === 'string') || column.length === 0
    const operatorNotSupportedOrEmpty =
      !supportedOperators.includes(operator) || operator.length === 0
    const valueIsStringAndNotEmpty = typeof value === 'string' && value !== ''
    const valueIsBoolean = typeof value === 'boolean'
    const valueIsANumber = typeof value === 'number'

    const valueIsAnObject = value instanceof Object

    if (argumentsCount < 3 || argumentsCount > 3)
      this[_throwError](
        'Where method takes 3 arguments (column,operator,value)!',
      )

    if (columnIsNotStringOrEmpty)
      this[_throwError]('Column should be string type and not be empty')

    if (notSupportedOperators.includes(operator))
      this[_throwError](
        `For the current used operator ${operator}, consider using corresponding method operator (isNotNull(), isNull(), whereIn(), whereNotIn(), isBetween(), isNotBetween())`,
      )

    if (operatorNotSupportedOrEmpty)
      this[_throwError](`Supported operators (${supportedOperators.join(',')})`)

    if (valueIsStringAndNotEmpty || valueIsBoolean || valueIsANumber)
      stateValue = value

    if (valueIsAnObject) {
      const valueKeys = Object.keys(value)
      const valueIsNullOrUndefined = [null, undefined].includes(value['value'])
      const valueIsAnObject = value['value'] instanceof Object
      const valueIsAnArray = Array.isArray(value['value'])
      const valueIsInvalidOrEmptyString =
        !value['value'] || value['value'] === ''

      const valueKeyIsNotPresent = !valueKeys.includes('value')
      const typeKeyIsNotPresent = !valueKeys.includes('type')
      const typeKeyIsNotStringType = typeof value['type'] != 'string'
      const typeKeyIsEmpty = value['type'] === ''

      if (valueKeyIsNotPresent)
        this[_throwError]('Value key is required and must carry a valid value!')

      if (
        valueIsNullOrUndefined ||
        valueIsAnObject ||
        valueIsAnArray ||
        valueIsInvalidOrEmptyString
      )
        this[_throwError](
          'Value can not be (null, undefined, {}, []) or empty!',
        )

      if (typeKeyIsNotPresent || typeKeyIsNotStringType || typeKeyIsEmpty)
        this[_throwError](
          'Type key is required and must contain a string type as value',
        )

      const _type = value['type']
      stateValue = Helper.castValue(value['value'], _type)
    }

    if (this.operatorSignal)
      state = {
        query: [...query, `${column} ${operator} ?`],
        values: [...values, stateValue],
      }
    else
      state = {
        query: [...query, `WHERE ${column} ${operator} ?`],
        values: [...values, stateValue],
      }

    return this[_clone](state, true)
  }

  /**
   * @param {string} column
   * @returns {this}
   */
  whereField(column) {
    const { query, values } = this.state
    const state = { query: [...query], values: [...values] }

    if (typeof column != 'string' || column.trim() == '')
      this[_throwError](
        '[column] argument is required & should be of type string!',
      )

    if (this.operatorSignal) state.query.push(`${column}`)
    else state.query.push(`WHERE ${column}`)

    return this[_clone](state)
  }

  /** @return {this}*/
  or() {
    const { query, values } = this.state
    return this[_clone]({ query: [...query, 'OR'], values: [...values] }, true)
  }

  /**
  @param {string} column
  @param {string} operator
  @param {boolean|number|string|object} value
  @return {this}*/
  orWhere(column, operator, value) {
    return this.#andOr(column, operator, value, 'OR', 'orWhere')
  }

  /**
   * @param {Closure} callback
   * @returns {this}
   */
  orGroup(callback) {
    return this.#group(callback, 'OR')
  }

  /** @return {this}*/
  and() {
    const { query, values } = this.state
    return this[_clone]({ query: [...query, 'AND'], values: [...values] }, true)
  }

  /**
  @param {string} column
  @param {string} operator
  @param {boolean|number|string|object} value
  @return {this}
  */
  andWhere(column, operator, value) {
    return this.#andOr(column, operator, value, 'AND', 'andWhere')
  }

  /**
   * @param {Closure} callback
   * @returns {this}
   */
  andGroup(callback) {
    return this.#group(callback, 'AND')
  }

  /**@param {string} column @param {Array} list @returns {this} */
  whereIn(column, list) {
    return this.#inOrNotIn(column, list, 'IN')
  }

  /**
   * @param {Array} list
   * @returns {this} */
  in(list) {
    return this[_inOrNotIn](list, 'IN')
  }

  /**@param {string} column @param {Array} list @returns {this} */
  whereNotIn(column, list) {
    return this.#inOrNotIn(column, list, 'NOT IN')
  }

  /**
   * @param {Array} list
   * @returns {this} */
  notIn(list) {
    return this[_inOrNotIn](list, 'NOT IN')
  }

  /** @param {string} column @returns {this} */
  isNull() {
    return this[_null]('IS NULL')
  }

  /** @returns {this} */
  isNotNull() {
    return this[_null]('IS NOT NULL')
  }

  /**
   * @param {number} start
   * @param {number} end
   * @returns {this}
   */
  isBetween(start, end) {
    return this[_between](start, end, 'BETWEEN ? AND ?')
  }

  /**
   * @param {number} start
   * @param {number} end
   * @returns {this}
   */
  isNotBetween(start, end) {
    return this[_between](start, end, 'NOT BETWEEN ? AND ?')
  }
}

export default Builder
