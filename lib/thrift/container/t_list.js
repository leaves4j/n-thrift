const util = require('util');
const { read, readList } = require('../reader');
const { write, writeList } = require('../writer');
const { getTypeValue, convertToTypedValue } = require('../utils');

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

    if (valueType && val !== null && val !== undefined && val[Symbol.iterator]) {
      for (const item of val) { // eslint-disable-line no-restricted-syntax
        this.push(item);
      }
    }
  }

  push(value) {
    const typeValue = this[convertToTypedValue](value);
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
  [convertToTypedValue](value) {
    try {
      return getTypeValue(value, this[vType]);
    } catch (e) {
      throw new Error(`${this.constructor.name} ${e.message}`);
    }
  }

  /**
   * convert to plain object
   */
  toObject() {
    if (this[vType] && this[vType].typeClass) {
      const plainArr = [];
      this.forEach((item) => {
        plainArr.push(item.toObject.apply(item));
      });
      return plainArr;
    }
    return [...this];
  }

  [util.inspect.custom]() {
    return this.toObject();
  }
}

module.exports = TList;
