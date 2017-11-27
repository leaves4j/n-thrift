const { enumCompiler } = require('./compiler');
/**
 *
 * @param {string} name
 * @param {Object[]} enumFieldAST
 * @param {string} fieldAST[].identifier
 * @param {string} fieldAST[].value
 * @param {*} options
 */
function enumGenerator(name, enumFieldAST, options) {
  const useESM = options && options.moduleFormat === 'esm';
  let currentValue = -1;
  const enumFields = enumFieldAST.map((field) => {
    const value = field.value ?
      Number(field.value) : currentValue + 1;
    currentValue = value;
    return {
      value,
      name: field.identifier
    };
  });
  const renderData = {
    useESM,
    enumName: name,
    enumFields
  };
  return enumCompiler(renderData);
}
module.exports = enumGenerator;
