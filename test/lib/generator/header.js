const test = require('ava');
const headerGenerator = require('../../../lib/generator/header');

test('enumGenerator', (t) => {
  const dependencies = [
    {
      name: 'shared',
      namespace: 'thrift.shared',
      relativePath: './thrift/shared'
    },
    {
      name: 'test',
      namespace: 'thrift.test',
      relativePath: './thrift/test'
    }
  ];

  t.snapshot(headerGenerator(dependencies, 'n-thrift', '1.0.0'));
  t.snapshot(headerGenerator(dependencies, 'n-thrift', '1.0.0', { moduleFormat: 'esm' }));
});

