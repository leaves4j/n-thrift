
const structGenerator = require('./struct');
const { serviceClientCompiler, serviceServerCompiler } = require('./compiler');

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

  const functionArgsStr = argsGenerator(name, 'TStruct', funcAST, options);

  const functionResultStr = resultGenerator(name, 'TStruct', funcAST, options);
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


function resultGenerator(name, extend, funcAST, options) {
  return funcAST.reduce(
    (code, func) => {
      const fields = Array.from(func.throws);
      if (func.functionType !== 'void') {
        fields.unshift({
          id: 0,
          identifier: 'success',
          fieldType: func.functionType
        });
      }
      return `${code}${structGenerator(`${name}$${func.identifier}$Result`, extend, fields, options)}\n`;
    },
    ''
  );
}

function argsGenerator(name, extend, funcAST, options) {
  return funcAST.reduce(
    (code, func) => `${code}${structGenerator(`${name}$${func.identifier}$Args`, extend, func.args, options)}\n`,
    ''
  );
}

if (process.env.NODE_ENV === 'test') {
  module.exports.resultGenerator = resultGenerator;
  module.exports.clientGenerator = clientGenerator;
  module.exports.serverGenerator = serverGenerator;
}

