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
 * @returns {string}
 */
function getFieldTypeString(fieldType) {
  if (typeof fieldType === 'string') {
    if (isBaseType(fieldType)) return `'${fieldType}'`;
    return `${fieldType}`;
  }
  if (fieldType.type === 'map') {
    return `{ type: TMap, keyType: ${getFieldTypeString(fieldType.keyFieldType)}, valueType: ${getFieldTypeString(fieldType.valueFieldType)} }`;
  }
  if (fieldType.type === 'set') {
    return `{ type: TSet, valueType: ${getFieldTypeString(fieldType.fieldType)} }`;
  }
  if (fieldType.type === 'list') {
    return `{ type: TList, valueType: ${getFieldTypeString(fieldType.fieldType)} }`;
  }
  /* istanbul ignore next */
  throw new Error(`fileType: ${fieldType} invalid!`);
}
exports.getFieldTypeString = getFieldTypeString;
