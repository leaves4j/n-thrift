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
 * @param {boolean} autoConvert
 */
function getTypeValue(value, type, autoConvert) {
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
      if (typeof value === 'number' || (typeof value === 'string' && !Number.isNaN(Number(value)))) {
        typeValue = value;
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

