const { read, readMap } = require('../reader');
const { write, writeMap } = require('../writer');
const { getTypeValue, getTypeValueSymbol } = require('../utils');

const kType = Symbol('keyType');
const vType = Symbol('keyType');
class TMap extends Map {
  /**
   * constructor
   * @param {*} val
   * @param {Object} keyType
   * @param {string} keyType.name
   * @param {Object} keyType.typeClass
   * @param {Object} valueType
   * @param {string} valueType.name
   * @param {Object} valueType.typeClass
   */
  constructor(val, keyType, valueType) {
    super();
    this[kType] = keyType;
    this[vType] = valueType;
    if (val !== null && val !== undefined) {
      // eslint-disable-next-line no-restricted-syntax
      for (const item of val) {
        const iterator = item[Symbol.iterator]();
        const mapKey = iterator.next().value;
        const mapValue = iterator.next().value;
        this.set(mapKey, mapValue);
      }
    }
  }

  set(key, value) {
    const kTypeValue = this[getTypeValueSymbol](key, this[kType]);
    const vTypeValue = this[getTypeValueSymbol](value, this[vType]);
    super.set(kTypeValue, vTypeValue);
  }

  [read](protocol) {
    readMap(this[kType], this[vType], protocol, this);
  }

  [write](protocol) {
    writeMap(this[kType], this[vType], protocol, this);
  }

  /**
   *
   * @param {*} value
   * @param {*} type
   * @param {string} fieldName
   */
  [getTypeValueSymbol](value, type) {
    try {
      return getTypeValue(value, type, false);
    } catch (e) {
      throw new Error(`${this.constructor.name} ${e.message}`);
    }
  }
}

module.exports = TMap;
