
const { namespaceCompiler } = require('./compiler');

function headerGenerator(dependencies, options) {
  const useESM = options && options.moduleFormat === 'esm';
  const { packageName, packageVersion } = options || {};

  const dependencyMap = new Map();
  dependencies.forEach((dep) => {
    dependencyMap.set(dep.name, dep);
  });
  const renderData = {
    packageVersion,
    packageName,
    useESM,
    dependencies
  };
  return namespaceCompiler(renderData);
}
module.exports = headerGenerator;
