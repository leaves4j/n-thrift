const { getFieldTypeString } = require('./helpers');
const { unionCompiler } = require('./compiler');


/**
 *
 * @param {string} name union name
 * @param {string} extend extend
 * @param {Object[]} fieldAST
 * @param {string} fieldAST.id
 * @param {string} fieldAST.option
 * @param {string | Object} fieldAST.fieldType
 * @param {string} fieldAST.identifier
 * @param {*} fieldAST.defaultValue
 * @param {Object} options
 * @param {string} options.moduleFormat 'cjs/esm'
 * @param {Function} options.fieldFormatter format struct field name
 */
function unionGenerator(name, extend, fieldAST, options) {
  const typeConvertKey = (options && options.keywords && options.keywords.convertToTypedValue) || 'convertToTypedValue';

  const fieldFormatter = options && options.fieldFormatter
    ? options.fieldFormatter
    : fieldName => fieldName;
  const useESM = options && options.moduleFormat === 'esm';
  const fields = fieldAST.map((ast) => {
    const field = {
      id: ast.id,
      name: ast.identifier,
      customName: fieldFormatter(ast.identifier),
      typeStr: getFieldTypeString(ast.fieldType),
      type: ast.fieldType,
      defaultValue: ast.defaultValue
    };
    if (typeof field.type !== 'string') {
      field.type = Object.assign({}, ast.fieldType);
      if (field.type.type === 'map') {
        field.type.keyTypeStr = getFieldTypeString(field.type.keyFieldType);
        field.type.valueTypeStr = getFieldTypeString(field.type.valueFieldType);
      } else if (field.type.type === 'set' || field.type.type === 'list') {
        field.type.typeStr = getFieldTypeString(field.type.fieldType);
      }
    }
    return field;
  });
  const renderData = {
    typeConvertKey,
    useESM,
    structName: name,
    extendStructName: extend,
    fields
  };
  return unionCompiler(renderData);
}
module.exports = unionGenerator;

