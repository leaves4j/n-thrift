const util = require('util');
const { read, readSet } = require('../reader');
const { write, writeSet } = require('../writer');
const { getTypeValue, convertToTypedValue } = require('../utils');

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
    if (val !== null && val !== undefined && val[Symbol.iterator]) {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of val) {
        this.add(item);
      }
    }
  }

  add(value) {
    const typeValue = this[convertToTypedValue](value);
    super.add(typeValue);
  }

  [read](protocol) {
    readSet(this[vType], protocol, this);
  }

  [write](protocol) {
    writeSet(this[vType], protocol, this);
  }

  toJSON() {
    return [...this];
  }
  /**
   * convert to plain object
   */
  toObject() {
    if (this[vType].typeClass) {
      return this.map(item => item.toObject.apply(item));
    }
    return [...this];
  }

  [util.inspect.custom]() {
    return this.toObject();
  }
  /**
   *
   * @param {*} value
   * @param {*} type
   * @param {string} fieldName
   */
  [convertToTypedValue](value) {
    try {
      return getTypeValue(value, this[vType]);
    } catch (e) {
      throw new Error(`${this.constructor.name} ${e.message}`);
    }
  }
}

module.exports = TSet;
