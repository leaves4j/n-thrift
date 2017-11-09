const structGenerator = require('./struct');

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

 */
function exceptionGenerator(name, extend, fieldAST, options) {
  return structGenerator(name, extend, fieldAST, options, true);
}
module.exports = exceptionGenerator;
