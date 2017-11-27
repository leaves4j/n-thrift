const fs = require('fs');
const util = require('util');
const path = require('path');
const mkdirp = require('mkdirp-promise');
const { fileGenerator } = require('./compiler');

const compileThriftToAst = require('./ast');
const defaultOptions = require('./default_options');


function genrator(thriftPath, outPath, options) {
  const generatorOptions = Object.assign({}, defaultOptions, options);

  compileThriftToAst(thriftPath).then((astMap) => {
    const files = [];
    astMap.forEach((ast, namespace) => {
      const outFilePath = namespace.replace(/\./g, '/');
      const fileName = `${path.basename(outFilePath)}.${generatorOptions.extname}`;
      const outAbsolutePath = path.resolve(outPath, path.dirname(outFilePath), fileName);
      files.push([outAbsolutePath, ast]);
    });
    return files;
  }).then(files => Promise.all(files.map(([filePath, ast]) => {
    const fileStr = fileGenerator(ast, generatorOptions);
    return mkdirp(path.dirname(filePath)).then(() => util.promisify(fs.writeFile)(filePath, fileStr, 'utf8'));
  })));
}
module.exports = genrator;
