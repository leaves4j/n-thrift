
const { headerCompiler } = require('./compiler');

function headerGenerator(dependencies, packageName, version, options) {
  const useESM = options && options.moduleFormat === 'esm';
  const keywords = (options && options.keywords) || {
    mapClass: 'TMap',
    setClass: 'TSet',
    listClass: 'TList',
    clientClass: 'TClient',
    serverClass: 'TServer',
    exceptionClass: 'TException',
    structClass: 'TStruct',
    sendSymbol: '$send',
    convertToTypedValueSymbol: '$convertToTypedValue'
  };
  const dependencyMap = new Map();
  dependencies.forEach((dep) => {
    dependencyMap.set(dep.name, dep);
  });
  const renderData = {
    version,
    packageName,
    useESM,
    keywords,
    dependencies: [...dependencyMap.values()]
  };
  return headerCompiler(renderData);
}
module.exports = headerGenerator;
