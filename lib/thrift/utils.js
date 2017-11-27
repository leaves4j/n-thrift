const { Int64 } = require('thrift');
const { ThriftType } = require('./type');

/**
 *
 * @param {number} typeEnum
 * @param {Object} type
 * @param {string} type.name
 * @param {Object} type.typeClass
 */
function isSameThriftType(typeEnum, type) {
  return typeEnum === getThriftType(type);
}
exports.isSameThriftType = isSameThriftType;

/**
 *
 * @param {number} typeEnum
 * @param {Object} type
 * @param {string} type.name
 * @param {Object} type.typeClass
 */
function getThriftType(type) {
  let typeEnum;

  switch (type.name) {
    case 'void':
      typeEnum = ThriftType.VOID;
      break;
    case 'bool':
      typeEnum = ThriftType.BOOL;
      break;
    case 'byte':
    case 'i8':
      typeEnum = ThriftType.BYTE;
      break;
    case 'double':
      typeEnum = ThriftType.DOUBLE;
      break;
    case 'i16':
      typeEnum = ThriftType.I16;
      break;
    case 'i32':
      typeEnum = ThriftType.I32;
      break;
    case 'i64':
      typeEnum = ThriftType.I64;
      break;
    case 'binary':
    case 'string':
      typeEnum = ThriftType.STRING;
      break;
    case 'map':
      typeEnum = ThriftType.MAP;
      break;
    case 'list':
      typeEnum = ThriftType.LIST;
      break;
    case 'set':
      typeEnum = ThriftType.SET;
      break;
    case 'struct':
    case 'union':
      typeEnum = ThriftType.STRUCT;
      break;
    default:
      throw new Error(`ThriftType:${type} invalid`);
  }
  return typeEnum;
}
exports.getThriftType = getThriftType;

/**
 *
 * @param {*} value
 * @param {Object} type
 * @param {string} type.name
 * @param {Object} type.typeClass
 * @param {Object} options
 */
function getTypeValue(value, type, options) {
  const { autoConvert = true, longsAsStrings = 'on' } = options || {};
  let typeValue = null;
  if (value === null || value === undefined) return typeValue;
  const { name: typeName, typeClass: TypeClass } = type;
  switch (typeName) {
    case 'bool':
      if (typeof value === 'boolean') {
        typeValue = value;
      } else if (autoConvert && (typeof value === 'number' || typeof value === 'string')) {
        typeValue = Boolean(value);
      } else {
        throw new Error(`except type 'boolean', but got ${value}`);
      }
      break;
    case 'byte':
    case 'i8':
    case 'double':
    case 'i16':
    case 'i32':
      if (typeof value === 'number') {
        typeValue = value;
      } else if (autoConvert) {
        typeValue = Number(value);
        if (Number.isNaN(typeValue)) {
          throw new Error(`except type 'number', but got ${value}`);
        }
      } else {
        throw new Error(`except type 'number', but got ${value}`);
      }
      break;
    case 'i64':
      if (value instanceof Int64) {
        if (longsAsStrings === 'on') {
          typeValue = Int64toDecimalString(value);
        } else if (longsAsStrings === 'auto') {
          const numericValue = value.toNumber();
          if (numericValue === Infinity) {
            typeValue = Int64toDecimalString(value);
          } else {
            typeValue = numericValue;
          }
        } else {
          typeValue = value.toNumber();
        }
      } else if (typeof value === 'number' || (typeof value === 'string' && !Number.isNaN(Number(value)))) {
        if (longsAsStrings === 'on') {
          typeValue = String(value);
        } else {
          typeValue = value;
        }
      } else {
        throw new Error(`except type 'number' or 'numeric string', but got ${value}`);
      }
      break;
    case 'binary':
      if (value instanceof Buffer) {
        typeValue = value;
      } else {
        throw new Error(`except type 'Buffer', but got ${value}`);
      }
      break;
    case 'string':
      if (typeof value === 'string') {
        typeValue = value;
      } else if (autoConvert && typeof value === 'number') {
        typeValue = String(value);
      } else {
        throw new Error(`except type 'string', but got ${value}`);
      }
      break;
    case 'map':
      typeValue = new TypeClass(value, type.keyType, type.valueType);
      break;
    case 'set':
    case 'list':
      typeValue = new TypeClass(value, type.valueType);
      break;
    case 'struct':
    case 'union':
      if (value instanceof TypeClass) {
        typeValue = value;
      } else {
        typeValue = new TypeClass(value);
      }
      break;
    default:
      throw new Error(`ThriftType:${type} invalid`);
  }
  return typeValue;
}
exports.getTypeValue = getTypeValue;

const convertToTypedValue = Symbol('convertToTypedValue');

exports.convertToTypedValue = convertToTypedValue;

/* eslint-disable no-bitwise,no-restricted-properties */
const POW2_24 = Math.pow(2, 24);
const POW2_32 = Math.pow(2, 32);
const POW10_11 = Math.pow(10, 11);
/**
 * convert int64 to decimal string
 * @param {Int64} i64
 */
function Int64toDecimalString(i64) {
  let b = i64.buffer;
  const o = i64.offset;
  if ((!b[o] && !(b[o + 1] & 0xe0)) ||
    (!~b[o] && !~(b[o + 1] & 0xe0))) {
    return i64.toString();
  }
  const negative = b[o] & 0x80;
  if (negative) {
    let incremented = false;
    const buffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; --i) {
      buffer[i] = (~b[o + i] + (incremented ? 0 : 1)) & 0xff;
      incremented |= b[o + i];
    }
    b = buffer;
  }
  const high2 = b[o + 1] + (b[o] << 8);
  let low = b[o + 7] + (b[o + 6] << 8) + (b[o + 5] << 16)
    + (b[o + 4] * POW2_24)
    + ((b[o + 3] + (b[o + 2] << 8)) * POW2_32)
    + (high2 * 74976710656);

  const high = Math.floor(low / POW10_11) + (high2 * 2814);
  low = (`00000000000${String(low % POW10_11)}`).slice(-11);
  return (negative ? '-' : '') + String(high) + low;
}
exports.Int64toDecimalString = Int64toDecimalString;
