const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers');
const { structGenerator } = require('./struct');
const { getFieldTypeString } = require('./helpers');

handlebars.registerHelper(helpers());
const serverTemplate = fs.readFileSync(path.resolve(__dirname, './template/service/server.hbs'), 'utf8');
const serverCompiler = handlebars.compile(serverTemplate);
const clientTemplate = fs.readFileSync(path.resolve(__dirname, './template/service/client.hbs'), 'utf8');
const clientCompiler = handlebars.compile(clientTemplate);
const resultTemplate = fs.readFileSync(path.resolve(__dirname, './template/service/result.hbs'), 'utf8');
const resultCompiler = handlebars.compile(resultTemplate);

/**
 *
 * @param {string} name
 * @param {string} extend
 * @param {Object[]} functions
 * @param {string} functions[].name
 * @param {boolean} functions[].oneway
 * @param {string|Object} functions[].functionType
 * @param {Object[]} functions[].args
 * @param {string} functions[].args[].name
 * @param {string} functions[].args[].customName
 * @param {Object} options
 * @param {boolean} options.legacy
 * @param {string} options.moduleFormat 'cjs/esm'
 * @param {Function} options.fieldFormatter format struct field name
 */
function serverGenerator(name, extend, functions, options) {
  const legacy = Boolean(options && options.legacy);
  const useESM = options && options.moduleFormat === 'esm';
  const extendServiceName = extend || 'Server';
  const renderData = {
    useESM,
    serviceName: name,
    extendServiceName,
    functions,
    legacy,
  };
  return serverCompiler(renderData);
}
exports.serverGenerator = serverGenerator;

/**
 *
 * @param {string} name
 * @param {string} extend
 * @param {Object[]} functions
 * @param {string} functions[].name
 * @param {boolean} functions[].oneway
 * @param {string|Object} functions[].functionType
 * @param {Object[]} functions[].args
 * @param {string} functions[].args[].name
 * @param {string} functions[].args[].customName
 * @param {Object} options
 * @param {boolean} options.legacy
 * @param {string} options.moduleFormat 'cjs/esm'
 */
function clientGenerator(name, extend, functions, options) {
  const legacy = Boolean(options && options.legacy);
  const useESM = options && options.moduleFormat === 'esm';
  const extendServiceName = extend || 'Client';
  const renderData = {
    useESM,
    serviceName: name,
    extendServiceName,
    functions,
    legacy,
  };
  return clientCompiler(renderData);
}
exports.clientGenerator = clientGenerator;

/**
 *
 * @param {string} name
 * @param {Object} func
 * @param {string} func.name
 * @param {boolean} func.oneway
 * @param {string|Object} func.functionType
 * @param {Object[]} func.throws
 * @param {string} func.throws[].id
 * @param {string} func.throws[].name
 * @param {string} func.throws[].type
 * @param {Object} options
 * @param {boolean} options.legacy
 * @param {string} options.moduleFormat 'cjs/esm'
 */
function resultGenerator(name, func, options) {
  const legacy = Boolean(options && options.legacy);

  const useESM = options && options.moduleFormat === 'esm';
  const throws = func.throws.map(exception =>
    Object.assign({ typeStr: getFieldTypeString(exception.type) }, exception));
  const renderData = {
    useESM,
    name: func.name,
    structName: `${name}$${func.name}$Result`,
    functionType: func.functionType,
    functionTypeStr: getFieldTypeString(func.functionType),
    throws,
    legacy,
  };
  if (typeof renderData.functionType !== 'string') {
    renderData.functionType = Object.assign({}, func.functionType);
    if (renderData.functionType.type === 'map') {
      renderData.functionType.keyTypeStr =
        getFieldTypeString(renderData.functionType.keyFieldType);
      renderData.functionType.valueTypeStr =
        getFieldTypeString(renderData.functionType.valueFieldType);
    } else if (renderData.functionType.type === 'set' || renderData.functionType.type === 'list') {
      renderData.functionType.typeStr = getFieldTypeString(renderData.functionType.fieldType);
    }
  }
  return resultCompiler(renderData);
}
exports.resultGenerator = resultGenerator;

function serviceGenerator(name, extend, funcAST, options) {

}
