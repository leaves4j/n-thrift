const { read, readList } = require('../reader');
const { write, writeList } = require('../writer');
const { getTypeValue, getTypeValueSymbol } = require('../utils');

const vType = Symbol('valueType');
class TList extends Array {
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
        this.push(item);
      }
    }
  }

  push(value) {
    const typeValue = this[getTypeValueSymbol](value);
    super.push(typeValue);
  }

  [read](protocol) {
    readList(this[vType], protocol, this);
  }

  [write](protocol) {
    writeList(this[vType], protocol, this);
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

module.exports = TList;
