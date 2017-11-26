const { constCompiler } = require('./compiler');

const { isBaseType, isContainerType, getFieldTypeString } = require('./helpers');
/**
 *
 * @param {string} name
 * @param {string | Object} type
 * @param {*} value
 * @param {*} options
 */
function constGenerator(name, type, value, options) {
  const useESM = options && options.moduleFormat === 'esm';
  const keywords = (options && options.keywords) || {};
  const fieldFormatter = options && options.fieldFormatter
    ? options.fieldFormatter
    : fieldName => fieldName;
  const valueStr = getConstValueStr(name, type, value, keywords, fieldFormatter);

  const renderData = {
    useESM,
    constName: name,
    constValue: valueStr
  };
  return constCompiler(renderData);
}
module.exports = constGenerator;

function getConstValueStr(name, type, value, keywords, fieldFormatter) {
  const {
    mapClass = 'TMap',
    setClass = 'TSet',
    listClass = 'TList'
  } = keywords;
  if (typeof type === 'string') {
    if (isBaseType(type)) {
      return value;
    }
    if (typeof value === 'string') {
      throw new Error(`const ${name} expect type '${type}', but got '${value}'`);
    }
    return `new ${type}(${getValueStr(value, fieldFormatter, true)})`;
  }
  if (typeof type.type === 'string' && isContainerType(type.type)) {
    if (type.type === 'map') {
      return `new ${mapClass}(${getValueStr(value, fieldFormatter, false)}, ${getFieldTypeString(type.keyFieldType)}, ${getFieldTypeString(type.valueFieldType)})`;
    }
    if (type.type === 'set') {
      return `new ${setClass}(${getValueStr(value, fieldFormatter, false)}, ${getFieldTypeString(type.fieldType)})`;
    }
    if (type.type === 'list') {
      return `new ${listClass}(${getValueStr(value, fieldFormatter, false)}, ${getFieldTypeString(type.fieldType)})`;
    }
    throw new Error(`Invalid type ${type.type}`);
  }
  throw new Error(`Invalid type ${type}`);
}

function getValueStr(value, fieldFormatter, isConvertKey) {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > 0) {
      if (typeof value[0] === 'string') {
        return `[${value.map(val => getValueStr(val, fieldFormatter, false)).join(', ')}]`;
      }
      if (isConvertKey) {
        return `{ ${value.map(({ key, value: val }) => `${fieldFormatter(key)}: ${getValueStr(val, fieldFormatter, false)}`).join(', ')} }`;
      }
      return `{ ${value.map(({ key, value: val }) => `${key}: ${getValueStr(val, fieldFormatter, false)}`).join(', ')} }`;
    }
    return 'null';
  }
  throw new Error(`Invalid const value: ${value}`);
}

