const { read, readStruct } = require('../reader');
const { write, writeStruct } = require('../writer');
const { getTypeValue, convertToTypedValue } = require('../utils');

const typeMap = new Map();
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

  /**
   *
   * @param {*} value
   * @param {*} type
   * @param {string} fieldName
   */
  [convertToTypedValue](value, type, fieldName) {
    try {
      return getTypeValue(value, type, false);
    } catch (e) {
      throw new Error(`${this.constructor.name}.${fieldName} ${e.message}`);
    }
  }

  static get Type() { return typeMap; }
}
module.exports = TStruct;
