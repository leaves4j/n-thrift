const { read, readSet } = require('../reader');
const { write, writeSet } = require('../writer');
const { getTypeValue, getTypeValueSymbol } = require('../utils');

const vType = Symbol('valueType');
class TSet extends Set {
  /**
   * constructor
   * @param {*} val
   * @param {Object} valueType
   * @param {string} valueType.name
   * @param {Object} valueType.typeClass
   */
  constructor(val, valueType) {
    super();
    this[vType] = valueType;
    if (val !== null && val !== undefined) {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of val) {
        this.add(item);
      }
    }
  }

  add(value) {
    const typeValue = this[getTypeValueSymbol](value);
    super.add(typeValue);
  }

  [read](protocol) {
    readSet(this[vType], protocol, this);
  }

  [write](protocol) {
    writeSet(this[vType], protocol, this);
  }

  /**
   *
   * @param {*} value
   * @param {*} type
   * @param {string} fieldName
   */
  [getTypeValueSymbol](value) {
    try {
      return getTypeValue(value, this[vType], false);
    } catch (e) {
      throw new Error(`${this.constructor.name} ${e.message}`);
    }
  }
}

module.exports = TSet;
