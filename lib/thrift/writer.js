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
 * @param {Map<number,Object>} fieldMap
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
 * @param {Object} keyType
 * @param {Object} valueType
 * @param {Object} protocol
 * @param {Map} context
 */
function writeMap(keyType, valueType, protocol, context) {
  const thriftKeyType = getThriftType(keyType);
  const thriftValueType = getThriftType(valueType);
  protocol.writeMapBegin(thriftKeyType, thriftValueType, context.size);
  context.forEach((value, key) => {
    writeFiledValue(key, thriftKeyType, keyType, protocol);
    writeFiledValue(value, thriftKeyType, valueType, protocol);
  });
  protocol.writeMapEnd();
}
exports.writeMap = writeMap;

/**
 *
 * @param {string|Object} type
 * @param {Object} protocol
 * @param {Array} context
 */
function writeList(type, protocol, context) {
  const thriftType = getThriftType(type);
  protocol.writeListBegin(thriftType, context.length);
  context.forEach((value) => {
    writeFiledValue(value, thriftType, type, protocol);
  });
  protocol.writeListEnd();
}
exports.writeList = writeList;

/**
 *
 * @param {Object} type
 * @param {Object} protocol
 * @param {Set} context
 */
function writeSet(type, protocol, context) {
  const thriftType = getThriftType(type);
  protocol.writeSetBegin(thriftType, context.size);
  context.forEach((value) => {
    writeFiledValue(value, thriftType, type, protocol);
  });
  protocol.writeSetEnd();
}
exports.writeSet = writeSet;
