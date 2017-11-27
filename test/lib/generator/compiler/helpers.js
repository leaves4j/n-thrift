const test = require('ava');
const {
  getFieldTypeString, isBaseType, isContainerType
} = require('../../../../lib/generator/compiler/helpers');

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
  const result = '{ name: \'list\', typeClass: TList, valueType: { name: \'map\', typeClass: TMap, keyType: { name: \'set\', typeClass: TSet, valueType: { name: \'i32\', typeClass: null } }, valueType: { name: \'map\', typeClass: TMap, keyType: { name: \'i32\', typeClass: null }, valueType: { name: \'set\', typeClass: TSet, valueType: { name: \'list\', typeClass: TList, valueType: { name: \'map\', typeClass: TMap, keyType: { name: \'struct\', typeClass: Insanity }, valueType: { name: \'string\', typeClass: null } } } } } } }';
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

