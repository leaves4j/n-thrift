const setValue = require('lodash.set');
const headerGenerator = require('./header');
const constGenerator = require('./const');
const structGenerator = require('./struct');
const exceptionGenerator = require('./exception');
const serviceGenerator = require('./service');
const enumGenerator = require('./enum');
const unionGenerator = require('./union');
const namespaceGenerator = require('./namespace');

function fileGenerator(ast, options) {
  let fileStr = '';
  fileStr += headerGenerator(ast.dependencies, options);
  ast.enums.forEach((enumerator) => {
    fileStr += enumGenerator(enumerator.identifier, enumerator.enumFields, options);
  });
  ast.consts.forEach((constant) => {
    fileStr += constGenerator(constant.identifier, constant.fieldType, constant.value, options);
  });
  ast.structs.forEach((struct) => {
    fileStr += structGenerator(struct.identifier, options.keywords.structClass, struct.fields, options);
  });
  ast.unions.forEach((union) => {
    fileStr += unionGenerator(union.identifier, options.keywords.structClass, union.fields, options);
  });
  ast.exceptions.forEach((exception) => {
    fileStr += exceptionGenerator(exception.identifier, options.keywords.exceptionClass, exception.fields, options);
  });
  ast.services.forEach((service) => {
    fileStr += serviceGenerator(service.identifier, service.extendIdentifier, service.functions, options);
  });
  return fileStr;
}
exports.fileGenerator = fileGenerator;

/**
 *
 * @param {Map} ast
 */
function namespaceFileGenerator(ast, options) {
  const namespaces = [];
  /* eslint-disable no-restricted-syntax */
  for (const key of ast.keys()) {
    namespaces.push(key.split('.'));
  }
  const files = new Map();
  getIndexFilePathMap(namespaces).forEach((file, path) => {
    files.set(path, namespaceGenerator(file, options));
  });
  return files;
}
exports.namespaceFileGenerator = namespaceFileGenerator;

function getIndexFilePathMap(namespaces) {
  const namespaceObject = {};
  namespaces.forEach((namespace) => {
    setValue(namespaceObject, namespace, null);
  });

  const fileMap = new Map();
  let currentPath = './';
  function walk(node) {
    if (node) {
      const keys = Object.keys(node);
      fileMap.set(currentPath, keys);
      const tempPath = currentPath;
      keys.forEach((key) => {
        currentPath = `${currentPath}/${key}/`;
        walk(node[key]);
      });
      currentPath = tempPath;
    }
  }
  walk(namespaceObject);
  return fileMap;
}

