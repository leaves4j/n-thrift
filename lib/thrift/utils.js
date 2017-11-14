import { type } from 'os';

const { ThriftType } = require('./type');

/**
 *
 * @param {number} typeEnum
 * @param {string|Object} type
 */
function isSameThriftType(typeEnum, type) {
  return typeEnum === getThriftType(type);
}
exports.isSameThriftType = isSameThriftType;

function getThriftType(type) {
  let typeEnum;
  if (typeof type === 'string') {
    switch (type) {
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
      default:
        throw new Error(`ThriftType:${type} invalid`);
    }
  }
  if (type.type) {
    if (type.type instanceof Map) {
      typeEnum = ThriftType.Map;
    } else if (type.type instanceof Set) {
      typeEnum = ThriftType.Set;
    } else if (type.type instanceof Array) {
      typeEnum = ThriftType.LIST;
    } else {
      throw new Error(`ThriftType:${type} invalid`);
    }
  } else {
    typeEnum = ThriftType.STRUCT;
  }
  return typeEnum;
}
exports.getThriftType = getThriftType;

/**
 *
 * @param {*} value
 * @param {string|Object} Type
 * @param {boolean} autoConvert
 */
function getTypeValue(value, Type, autoConvert) {
  let typeValue = null;
  if (value === null || value === undefined) return typeValue;
  if (typeof Type === 'string') {
    switch (Type) {
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
      case 'i64':
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
      default:
        throw new Error(`ThriftType:${Type} invalid`);
    }
  }
  if (Type.type) {
    const ContainerType = Type.type;
    if (ContainerType instanceof Map) {
      typeValue = new ContainerType(value, Type.keyType, Type.valueType);
    } else if (ContainerType instanceof Set || ContainerType instanceof Array) {
      typeValue = new ContainerType(value, Type.valueType);
    } else {
      throw new Error(`ThriftType:${Type} invalid`);
    }
  }
  if (value instanceof Type) {
    typeValue = value;
  } else {
    typeValue = new Type(value);
  }
  return value;
}
exports.getTypeValue = getTypeValue;
const getTypeValueSymbol = Symbol('getTypeValue');

exports.getTypeValueSymbol = getTypeValueSymbol;
