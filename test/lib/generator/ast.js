
const test = require('ava');
const path = require('path');
const _ = require('lodash');
const compileThriftToAst = require('../../../lib/generator/ast');

test('compileThriftToAst', async (t) => {
  const thriftFilePath = path.resolve(__dirname, '../../helpers');
  const ast = await compileThriftToAst(thriftFilePath);
  t.snapshot(ast);
});
