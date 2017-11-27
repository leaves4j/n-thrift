const baseType = ['void', 'bool', 'byte', 'i8', 'i16', 'i32', 'i64', 'double', 'string', 'binary'];
const containerType = ['list', 'set', 'map'];

/**
 *
 * @param {string} typeName
 * @returns {boolean}
 */
function isBaseType(typeName) {
  return baseType.includes(typeName);
}
exports.isBaseType = isBaseType;

/**
 *
 * @param {string} typeName
 * @returns {boolean}
 */
function isContainerType(typeName) {
  return containerType.includes(typeName);
}
exports.isContainerType = isContainerType;

/**
 *
 * @param {string|Object} fieldType
 * @param {Object} fieldType
 * @param {string} fieldType.mapClass
 * @param {string} fieldType.setClass
 * @param {string} fieldType.listClass
 * @returns {string}
 */
function getFieldTypeString(fieldType, keywords) {
  const {
    mapClass = 'TMap',
    setClass = 'TSet',
    listClass = 'TList'
  } = keywords || {};
  if (typeof fieldType === 'string') {
    if (isBaseType(fieldType)) return `{ name: '${fieldType}', typeClass: null }`;
    return `{ name: 'struct', typeClass: ${fieldType} }`;
  }
  if (fieldType.type === 'map') {
    return `{ name: 'map', typeClass: ${mapClass}, keyType: ${getFieldTypeString(fieldType.keyFieldType)}, valueType: ${getFieldTypeString(fieldType.valueFieldType)} }`;
  }
  if (fieldType.type === 'set') {
    return `{ name: 'set', typeClass: ${setClass}, valueType: ${getFieldTypeString(fieldType.fieldType)} }`;
  }
  if (fieldType.type === 'list') {
    return `{ name: 'list', typeClass: ${listClass}, valueType: ${getFieldTypeString(fieldType.fieldType)} }`;
  }
  /* istanbul ignore next */
  throw new Error(`fileType: ${fieldType} invalid!`);
}
exports.getFieldTypeString = getFieldTypeString;
