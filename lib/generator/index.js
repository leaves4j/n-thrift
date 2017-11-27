const fs = require('fs');
const util = require('util');
const path = require('path');
const mkdirp = require('mkdirp-promise');
const { fileGenerator, namespaceFileGenerator } = require('./compiler');

const compileThriftToAst = require('./ast');
const defaultOptions = require('./default_options');


function generator(thriftPath, outPath, options) {
  const generatorOptions = Object.assign({}, defaultOptions, options);

  compileThriftToAst(thriftPath)
    .then((astMap) => {
      const files = [];
      astMap.forEach((ast, namespace) => {
        const outFilePath = namespace.replace(/\./g, '/');
        const fileName = `${path.basename(outFilePath)}.${generatorOptions.extname}`;
        const outAbsolutePath = path.resolve(outPath, path.dirname(outFilePath), fileName);
        files.push([outAbsolutePath, fileGenerator(ast, generatorOptions)]);
      });
      namespaceFileGenerator(astMap, generatorOptions).forEach((fileStr, fileDirPath) => {
        const outAbsolutePath = path.resolve(outPath, fileDirPath, 'index.js');
        files.push([outAbsolutePath, fileStr]);
      });

      return Promise.all(files.map(([filePath, fileStr]) => mkdirp(path.dirname(filePath))
        .then(() => util.promisify(fs.writeFile)(filePath, fileStr, 'utf8'))));
    });
}
module.exports = generator;

