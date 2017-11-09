const test = require('ava');
const {
  getFieldTypeString, isBaseType, isContainerType
} = require('../../../lib/generator/helpers');

test('getFieldTypeString', (t) => {
  const fieldType = {
    type: 'list',
    fieldType: {
      type: 'map',
      keyFieldType: {
        type: 'set',
        fieldType: 'i32'
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
              valueFieldType: 'string'
            }
          }
        }
      }
    }
  };
  const str = getFieldTypeString(fieldType);
  const result = '{ type: TList, valueType: { type: TMap, keyType: { type: TSet, valueType: \'i32\' }, valueType: { type: TMap, keyType: \'i32\', valueType: { type: TSet, valueType: { type: TList, valueType: { type: TMap, keyType: Insanity, valueType: \'string\' } } } } } }';
  t.is(str, result);
});

test('isBaseType', (t) => {
  t.true(isBaseType('void'));
  t.true(isBaseType('byte'));
  t.true(isBaseType('i8'));
  t.true(isBaseType('i16'));
  t.true(isBaseType('i32'));
  t.true(isBaseType('i64'));
  t.true(isBaseType('bool'));
  t.true(isBaseType('string'));
  t.true(isBaseType('binary'));
  t.true(isBaseType('double'));
  t.false(isBaseType('map'));
  t.false(isBaseType('Struct'));
});

test('isContainerType', (t) => {
  t.true(isContainerType('map'));
  t.true(isContainerType('set'));
  t.true(isContainerType('list'));
  t.false(isContainerType('string'));
  t.false(isContainerType('Struct'));
});

