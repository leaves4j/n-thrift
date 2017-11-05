
const structGenerator = require('./struct');
const { getFieldTypeString } = require('./helpers');
const { serviceClientCompiler, serviceResultCompiler, serviceServerCompiler } = require('./compiler');

/**
 *
 * @param {string} name service name
 * @param {string} extend extend service name
 * @param {Object[]} funcAST ast
 * @param {string} funcAST[].type
 * @param {string|Object} funcAST[].functionType
 * @param {string} funcAST[].identifier
 * @param {string} funcAST[].oneway
 * @param {Object[]} funcAST[].args
 * @param {Object[]} funcAST[].throws
 * @param {Object} options
 * @param {boolean} options.legacy
 * @param {string} options.moduleFormat 'cjs/esm'
 * @param {Function} options.fieldFormatter format struct field name
 */
function serviceGenerator(name, extend, funcAST, options) {
  const fieldFormatter = (options && options.fieldFormatter) || (x => x);
  const functionArgsStr = funcAST.reduce(
    (code, func) => `${code}${structGenerator(`${name}$${func.identifier}$Args`, 'Struct', func.args, options)}\n`,
    ''
  );
  const functions = funcAST.map((func) => {
    const args = func.args.map(arg => ({
      id: arg.id,
      option: Boolean(arg.option),
      type: arg.fieldType,
      name: arg.identifier,
      customName: fieldFormatter(arg.identifier),
      defaultValue: arg.defaultValue
    }));
    const throws = func.args.map(arg => ({
      id: arg.id,
      type: arg.fieldType,
      name: arg.identifier
    }));
    return {
      name: func.identifier,
      oneway: Boolean(func.oneway),
      functionType: func.functionType,
      args,
      throws
    };
  });
  const functionResultStr = functions.reduce(
    (code, func) => `${code}${resultGenerator(name, func, options)}\n`,
    ''
  );
  const clientStr = clientGenerator(name, extend, functions, options);
  const serverStr = serverGenerator(name, extend, functions, options);
  return functionArgsStr + functionResultStr + clientStr + serverStr;
}
module.exports = serviceGenerator;

/**
 *
 * @param {string} name service name
 * @param {string} extend extend service name
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
function serverGenerator(name, extend, functions, options) {
  const legacy = Boolean(options && options.legacy);
  const useESM = options && options.moduleFormat === 'esm';
  const extendServiceName = extend ? `${extend}Server` : 'Server';
  const renderData = {
    useESM,
    serviceName: name,
    extendServiceName,
    functions,
    legacy
  };
  return serviceServerCompiler(renderData);
}

/**
 *
 * @param {string} name service name
 * @param {string} extend extend service name
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
  const extendServiceName = extend ? `${extend}Client` : 'Client';
  const renderData = {
    useESM,
    serviceName: name,
    extendServiceName,
    functions,
    legacy
  };
  return serviceClientCompiler(renderData);
}


/**
 *
 * @param {string} name service name
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
    legacy
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
  return serviceResultCompiler(renderData);
}

if (process.env.NODE_ENV === 'test') {
  module.exports.resultGenerator = resultGenerator;
  module.exports.clientGenerator = clientGenerator;
  module.exports.serverGenerator = serverGenerator;
}

