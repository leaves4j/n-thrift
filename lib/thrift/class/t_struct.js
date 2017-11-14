const { read, readStruct } = require('../reader');
const { write, writeStruct } = require('../writer');
const { getTypeValue, getTypeValueSymbol } = require('../utils');

/**
 * base struct class
 * @class TStruct
 */
class TStruct {
  /**
   * read
   * @param {Object} protocol
   */
  [read](protocol) {
    readStruct(this.constructor.Type, protocol, this);
  }

  /**
   * write
   * @param {Object} protocol
   */
  [write](protocol) {
    writeStruct(this.constructor.Type, protocol, this);
  }

  static get Type() {
    throw new Error(`'${this.constructor.name}.Type' is invalid`);
  }
  /**
   *
   * @param {*} value
   * @param {*} type
   * @param {string} fieldName
   */
  [getTypeValueSymbol](value, type, fieldName) {
    try {
      return getTypeValue(value, type, false);
    } catch (e) {
      throw new Error(`${this.constructor.name}.${fieldName} ${e.message}`);
    }
  }
}
module.exports = TStruct;
