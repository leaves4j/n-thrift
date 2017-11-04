const test = require('ava');
const {
  getFieldTypeString,
} = require('../../../lib/generator/helpers');

test('getFieldTypeString', (t) => {
  const fieldType = {
    type: 'list',
    fieldType: {
      type: 'map',
      keyFieldType: {
        type: 'set',
        fieldType: 'i32',
      },
      valueFieldType: {
        type: 'map',
        keyFieldType: 'i32',
        valueFieldType: {
          type: 'set',
          fieldType: {
            type: 'list',
            fieldType: {
              type: 'map',
              keyFieldType: 'Insanity',
              valueFieldType: 'string',
            },
          },
        },
      },
    },
  };
  const str = getFieldTypeString(fieldType);
  const result = '{ name: \'list\', type: { name: \'map\', keyType: { name: \'set\', type: \'i32\' }, valueType: { name: \'map\', keyType: \'i32\', valueType: { name: \'set\', type: { name: \'list\', type: { name: \'map\', keyType: Insanity, valueType: \'string\' } } } } } }';
  t.is(str, result);
});
