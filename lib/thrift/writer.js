const { Thrift } = require('thrift');
const { getThriftType } = require('./utils');

const write = Symbol('write');
exports.write = write;

/**
 *
 * @param {Object} value
 * @param {number} fieldType
 * @param {Object} type
 * @param {string} type.name
 * @param {Object} type.typeClass
 * @param {Object} protocol
 */
function writeFiledValue(value, fieldType, type, protocol) {
  switch (fieldType) {
    case Thrift.Type.BOOL:
      protocol.writeBool(value);
      break;
    case Thrift.Type.BYTE:
      protocol.writeByte(value);
      break;
    case Thrift.Type.I16:
      protocol.writeI16(value);
      break;
    case Thrift.Type.I32:
      protocol.writeI32(value);
      break;
    case Thrift.Type.I64:
      protocol.writeI64(value);
      break;
    case Thrift.Type.DOUBLE:
      protocol.writeDouble(value);
      break;
    case Thrift.Type.STRING:
      if (type.name === 'string') {
        protocol.writeString(value);
      } else {
        protocol.writeBinary(value);
      }
      break;
    case Thrift.Type.LIST:
      value[write](protocol);
      break;
    case Thrift.Type.SET:
      value[write](protocol);
      break;
    case Thrift.Type.MAP:
      value[write](protocol);
      break;
    case Thrift.Type.STRUCT:
      value[write](protocol);
      break;
    default:
  }
}
exports.writeFiledValue = writeFiledValue;
/**
 *
 * @param {Map<number,string|Object>} fieldMap
 * @param {Object} protocol
 * @param {Object} context
 */
function writeStruct(fieldMap, protocol, context) {
  protocol.writeStructBegin();
  fieldMap.forEach((field, id) => {
    const fieldType = getThriftType(field.type);
    const value = context[field.customName];
    if (value !== undefined && value !== null) {
      protocol.writeFieldBegin(field.name, fieldType, id);
      writeFiledValue(value, fieldType, field.type, protocol);
      protocol.writeFieldEnd();
    }
  });
  protocol.writeFieldStop();
  protocol.writeStructEnd();
}
exports.writeStruct = writeStruct;

/**
 *
 * @param {string|Object} keyTypeClass
 * @param {Object} protocol
 * @param {Map} context
 */
function writeMap(keyTypeClass, valueTypeClass, protocol, context) {
  const keyType = getThriftType(keyTypeClass);
  const valueType = getThriftType(valueTypeClass);
  protocol.writeMapBegin(keyType, valueType, context.size);
  context.forEach((value, key) => {
    writeFiledValue(key, keyType, keyTypeClass, protocol);
    writeFiledValue(value, keyType, valueTypeClass, protocol);
  });
  protocol.writeMapEnd();
}
exports.writeMap = writeMap;

/**
 *
 * @param {string|Object} typeClass
 * @param {Object} protocol
 * @param {Set} context
 */
function writeList(typeClass, protocol, context) {
  const type = getThriftType(typeClass);
  protocol.writeListBegin(type, context.length);
  context.forEach((value) => {
    writeFiledValue(value, type, typeClass, protocol);
  });
  protocol.writeListEnd();
}
exports.writeList = writeList;
