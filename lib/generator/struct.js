const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers');

const { isBaseType, getFieldTypeString } = require('./helpers');

const template = fs.readFileSync(path.resolve(__dirname, './template/struct.hbs'), 'utf8');
const compiler = handlebars.compile(template);
handlebars.registerHelper(helpers());
handlebars.registerHelper('isBaseType', isBaseType);
/**
 *
 * @param {string} name
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
function structGenerator(name, fieldAST, options) {
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
      defaultValue: ast.defaultValue,
    };
    if (typeof field.type !== 'string') {
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
    fields,
  };
  return compiler(renderData);
}
exports.structGenerator = structGenerator;

