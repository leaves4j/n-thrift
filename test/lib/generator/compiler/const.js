
const test = require('ava');
const _ = require('lodash');
const constGenerator = require('../../../../lib/generator/compiler/const');

test('enumGenerator', (t) => {
  const constMap = {
    fieldType: {
      keyFieldType: 'i32',
      type: 'map',
      valueFieldType: 'string'
    },
    identifier: 'myNumberza2',
    type: 'const',
    value: [
      {
        key: '1',
        value: '\'123\''
      },
      {
        key: '2',
        value: '\'123\''
      }
    ]
  };
  t.snapshot(constGenerator(constMap.identifier, constMap.fieldType, constMap.value));
  const constString = {
    fieldType: 'i32',
    identifier: 'cNumber',
    type: 'const',
    value: '123'
  };
  t.snapshot(constGenerator(constString.identifier, constString.fieldType, constString.value));
  const constStruct = {
    fieldType: 'Xtruct',
    identifier: 'myStruct',
    type: 'const',
    value: [
      {
        key: '\'string_thing\'',
        value: '\'123\''
      },
      {
        key: '\'byte_thing\'',
        value: '123'
      }
    ]
  };
  t.snapshot(constGenerator(constStruct.identifier, constStruct.fieldType, constStruct.value));
  const options = {
    moduleFormat: 'esm',
    fieldFormatter: _.camelCase
  };
  t.snapshot(constGenerator(constStruct.identifier, constStruct.fieldType, constStruct.value, options));
});

