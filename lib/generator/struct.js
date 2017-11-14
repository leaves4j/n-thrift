const { getFieldTypeString } = require('./helpers');
const { structCompiler } = require('./compiler');


/**
 *
 * @param {string} name struct name
 * @param {string} extend extend struct name
 * @param {Object[]} fieldAST
 * @param {string} fieldAST.id
 * @param {string} fieldAST.option
 * @param {string | Object} fieldAST.fieldType
 * @param {string} fieldAST.identifier
 * @param {*} fieldAST.defaultValue
 * @param {Object} options
 * @param {string} options.moduleFormat 'cjs/esm'
 * @param {Function} options.fieldFormatter format struct field name
 * @param {boolean} options.isException
 */
function structGenerator(name, extend, fieldAST, options) {
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
    useESM,
    structName: name,
    extendStructName: extend,
    fields
  };
  return structCompiler(renderData);
}
module.exports = structGenerator;

