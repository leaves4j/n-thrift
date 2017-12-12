const util = require('util');
const { read, readMap } = require('../reader');
const { write, writeMap } = require('../writer');
const { getTypeValue, convertToTypedValue } = require('../utils');

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
      if (val[Symbol.iterator]) {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of val) {
          const iterator = item[Symbol.iterator]();
          const mapKey = iterator.next().value;
          const mapValue = iterator.next().value;
          this.set(mapKey, mapValue);
        }
      } else if (typeof val === 'object') {
        Object.keys(val).forEach((key) => {
          this.set(key, val[key]);
        });
      }
    }
  }

  set(key, value) {
    const kTypeValue = this[convertToTypedValue](key, this[kType]);
    const vTypeValue = this[convertToTypedValue](value, this[vType]);
    super.set(kTypeValue, vTypeValue);
  }

  [read](protocol) {
    readMap(this[kType], this[vType], protocol, this);
  }

  [write](protocol) {
    writeMap(this[kType], this[vType], protocol, this);
  }

  toJSON() {
    return [...this];
  }

  /**
   * convert to plain object
   */
  toObject() {
    if ((this[kType] && this[kType].typeClass) || (this[vType] && this[vType].typeClass)) {
      const plainMap = new Map();
      this.forEach((value, key) => {
        plainMap.set(
          this[kType] && this[kType].typeClass ? key.toObject.apply(key) : key,
          this[kType] && this[vType].typeClass ? value.toObject.apply(value) : value
        );
      });
      return plainMap;
    }
    return new Map(this);
  }
  /**
   *
   * @param {*} value
   * @param {*} type
   * @param {string} fieldName
   */
  [convertToTypedValue](value, type) {
    try {
      return getTypeValue(value, type);
    } catch (e) {
      throw new Error(`${this.constructor.name} ${e.message}`);
    }
  }

  [util.inspect.custom]() {
    return this.toObject();
  }
}

module.exports = TMap;
