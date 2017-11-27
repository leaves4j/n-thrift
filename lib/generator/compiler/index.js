const headerGenerator = require('./header');
const constGenerator = require('./const');
const structGenerator = require('./struct');
const exceptionGenerator = require('./exception');
const serviceGenerator = require('./service');
const enumGenerator = require('./enum');
const unionGenerator = require('./union');


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
