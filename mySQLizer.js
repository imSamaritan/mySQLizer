import mysql from 'mysql2/promise'
import debug from 'debug'
import Execute from './execute/Execute.js'
import Builder from './builder/Builder.js'
import {
  _cloneMethodSymbol as _clone,
  _throwErrorMethodSymbol as _throwError,
  _setTable,
} from './helper/Helper.js'

const queryDebugger = debug('mysqlizer:query')

class mySQLizer extends Builder {
  #options
  #state
  #isOperator
  #executeMethod
  #execute
  #table

  /**
   * @param {{query: string[], values: (number|string)[]}} state
   * @param {boolean} isOperator
   * @param {string} executeMethod
   */
  constructor(
    options = {},
    state = { query: [], values: [] },
    isOperator = false,
    executeMethod = 'exec',
  ) {
    super()
    this.#options = options
    this.#state = state
    this.#isOperator = isOperator
    this.#executeMethod = executeMethod

    this.#execute = new Execute(options)
  }

  /**
   *
   * @param {Error} error
   * @returns {never}
   */
  //ERROR HANDLE
  [_throwError](error) {
    throw new Error(error)
  }

  /**
   * @param {{query: string[], values: (number|string)[]}} state
   * @param {boolean} isOperator
   * @param {string} executeMethod
   *
   * @return {mySQLizer}
   */
  [_clone](
    state,
    isOperator = this.#isOperator,
    executeMethod = this.#executeMethod,
  ) {
    const instance = new this.constructor(
      this.#options,
      state,
      isOperator,
      executeMethod,
    )
    instance.#execute = this.#execute
    return instance
  }

  /**
   *
   * @param {string} table
   * @returns {this}
   */
  table(table) {
    const { query, values } = this.state
    return this[_clone]({ query: [...query, `${table}`], values: [...values] })
  }

  /*** @return {string}*/
  get _table() {
    return this.#table
  }

  /*** @return {{query: string[], values: (number|string)[]}}*/
  get state() {
    return this.#state
  }

  get operatorSignal() {
    return this.#isOperator
  }

  /**@return {Promise<mysql.QueryResult>} */
  async done() {
    const { query, values } = this.#state
    const method = this.#executeMethod
    const sql = query.join(' ') + ';'
    const queryLastPart = query[query.length - 1]

    if (queryLastPart === 'AND' || queryLastPart === 'OR') {
      throw new Error(
        `SQL query can not end with a logical operator [${queryLastPart}]`,
      )
    }

    queryDebugger(this.#state)
    return await this.#execute[method](sql, values)
  }

  /**
   * @param {function(mysql.QueryResult): void} [resolve]
   * @param {function(Error): void} [reject]
   * @returns {Promise<mysql.QueryResult>}
   */
  then(resolve, reject) {
    return this.done().then(resolve, reject)
  }

  /**
   * @param {function(Error): void} [reject]
   * @returns {Promise<mysql.QueryResult>}
   */
  catch(reject) {
    return this.done().catch(reject)
  }

  /**
   * @param {function(): void} [callback]
   * @returns {Promise<mysql.QueryResult>}
   */
  finally(callback) {
    return this.done().finally(callback)
  }
}

// Export mySQLizer as default
export default mySQLizer
