const { Thrift } = require('thrift');
const { isSameThriftType } = require('./utils');


/* eslint no-param-reassign: ["error", { "ignorePropertyModificationsFor": ["context"] }] */
const read = Symbol('read');
exports.read = read;

/**
 *
 * @param {Map<Object>} fieldMap
 * @param {Object} protocol
 * @param {Object} context
 */
function readStruct(fieldMap, protocol, context) {
  protocol.readStructBegin();
  while (true) {
    const { ftype, fid } = protocol.readFieldBegin();
    if (ftype === Thrift.Type.STOP) {
      break;
    }
    const field = fieldMap.get(fid);
    if (field !== undefined) {
      context[field.customName] = readFieldValue(ftype, field.type, protocol);
    } else {
      protocol.skip(ftype);
    }
    protocol.readFieldEnd();
  }
  protocol.readStructEnd();
}
exports.readStruct = readStruct;

/**
 *
 * @param {Object} TypeClass
 * @param {Object} protocol
 * @param {Map} context
 */
function readMap(keyType, valueType, protocol, context) {
  const { ktype, vtype, size } = protocol.readMapBegin();
  for (let i = 0; i < size; ++i) {
    const key = readFieldValue(ktype, keyType, protocol);
    const value = readFieldValue(vtype, valueType, protocol);
    if (key !== undefined && key !== null) {
      context.set(key, value);
    }
  }
  protocol.readMapEnd();
}
exports.readMap = readMap;

/**
 *
 * @param {Object} type
 * @param {Object} protocol
 * @param {Set} context
 */
function readSet(type, protocol, context) {
  const { etype, size } = protocol.readSetBegin();
  for (let i = 0; i < size; ++i) {
    const value = readFieldValue(etype, type, protocol);
    if (value !== undefined && value !== null) {
      context.add(value);
    }
  }
  protocol.readSetEnd();
}
exports.readSet = readSet;

/**
 *
 * @param {Object} type
 * @param {Object} protocol
 * @param {Array} context
 */
function readList(type, protocol, context) {
  const { etype, size } = protocol.readListBegin();
  for (let i = 0; i < size; ++i) {
    const value = readFieldValue(etype, type, protocol);
    if (value !== undefined && value !== null) {
      context.push(value);
    }
  }
  protocol.readListEnd();
}
exports.readList = readList;

/**
 *
 * @param {number} thriftFieldType
 * @param {Object} type
 * @param {string} type.name
 * @param {Object} type.typeClass
 * @param {Object} protocol
 */
function readFieldValue(thriftFieldType, type, protocol) {
  if (!isSameThriftType(thriftFieldType, type)) {
    protocol.skip(thriftFieldType);
    return null;
  }

  let val = null;
  const { typeClass: TypeClass } = type;
  switch (thriftFieldType) {
    case Thrift.Type.BOOL:
      val = protocol.readBool();
      break;
    case Thrift.Type.BYTE:
      val = protocol.readByte();
      break;
    case Thrift.Type.I16:
      val = protocol.readI16();
      break;
    case Thrift.Type.I32:
      val = protocol.readI32();
      break;
    case Thrift.Type.I64:
      val = protocol.readI64();
      break;
    case Thrift.Type.DOUBLE:
      val = protocol.readDouble();
      break;
    case Thrift.Type.STRING:
      if (type.name === 'string') {
        val = protocol.readString();
      } else {
        val = protocol.readBinary();
      }
      break;
    case Thrift.Type.LIST:
      val = new TypeClass(null, type.valueType);
      val[read](protocol);
      break;
    case Thrift.Type.SET:
      val = new TypeClass(null, type.valueType);
      val[read](protocol);
      break;
    case Thrift.Type.MAP:
      val = new TypeClass(null, type.keyType, type.valueType);
      val[read](protocol);
      break;
    case Thrift.Type.STRUCT:
      val = new TypeClass();
      val[read](protocol);
      break;
    default:
      protocol.skip(thriftFieldType);
  }
  return val;
}
exports.readField = readFieldValue;
