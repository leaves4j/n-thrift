const test = require('ava');
const enumGenerator = require('../../../../lib/generator/compiler/enum');

test('enumGenerator', (t) => {
  const ast = [
    {
      type: 'enumField',
      identifier: 'ONE',
      value: null
    },
    {
      type: 'enumField',
      identifier: 'TWO',
      value: '2'
    },
    {
      type: 'enumField',
      identifier: 'THREE',
      value: null
    },
    {
      type: 'enumField',
      identifier: 'FIVE',
      value: '5'
    },
    {
      type: 'enumField',
      identifier: 'SIX',
      value: null
    },
    {
      type: 'enumField',
      identifier: 'EIGHT',
      value: '8'
    }
  ];

  t.snapshot(enumGenerator('Numberz', ast));
  t.snapshot(enumGenerator('Numberz', ast, { moduleFormat: 'esm' }));
});

