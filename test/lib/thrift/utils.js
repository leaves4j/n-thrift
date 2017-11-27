const test = require('ava');
const { Int64 } = require('thrift');
const TMap = require('../../../lib/thrift/container/t_map');
const TSet = require('../../../lib/thrift/container/t_set');
const TList = require('../../../lib/thrift/container/t_list');
const { ThriftType } = require('../../../lib/thrift/type');
const { getThriftType, getTypeValue, isSameThriftType } = require('../../../lib/thrift/utils');

test('getThriftType', (t) => {
  t.is(getThriftType({ name: 'void' }), ThriftType.VOID);
  t.is(getThriftType({ name: 'bool' }), ThriftType.BOOL);
  t.is(getThriftType({ name: 'byte' }), ThriftType.BYTE);
  t.is(getThriftType({ name: 'double' }), ThriftType.DOUBLE);
  t.is(getThriftType({ name: 'i16' }), ThriftType.I16);
  t.is(getThriftType({ name: 'i32' }), ThriftType.I32);
  t.is(getThriftType({ name: 'i64' }), ThriftType.I64);
  t.is(getThriftType({ name: 'binary' }), ThriftType.STRING);
  t.is(getThriftType({ name: 'string' }), ThriftType.STRING);
  t.is(getThriftType({ name: 'map' }), ThriftType.MAP);
  t.is(getThriftType({ name: 'list' }), ThriftType.LIST);
  t.is(getThriftType({ name: 'set' }), ThriftType.SET);
  t.is(getThriftType({ name: 'struct' }), ThriftType.STRUCT);
  t.is(getThriftType({ name: 'union' }), ThriftType.STRUCT);
});

test('isSameThriftType', (t) => {
  t.true(isSameThriftType(ThriftType.BOOL, { name: 'bool' }));
});

test('getTypeValue with struct', (t) => {
  const val = new MyStruct();
  t.is(getTypeValue(val, { name: 'struct', typeClass: MyStruct }), val);
  t.is(getTypeValue('aaa', { name: 'struct', typeClass: MyStruct }).val, new MyStruct('aaa').val);
});

test('getTypeValue with map', (t) => {
  const mapVal = [['hello', 32]];
  const typeMapVal = getTypeValue(mapVal, {
    name: 'map', typeClass: TMap, keyType: { name: 'string' }, valueType: { name: 'i32' }
  });
  t.is(typeMapVal.get('hello'), 32);
});

test('getTypeValue with set', (t) => {
  const setVal = [123123];
  const typeSetVal = getTypeValue(setVal, {
    name: 'set', typeClass: TSet, valueType: { name: 'i32' }
  });
  t.true(typeSetVal.has(123123));
});

test('getTypeValue with list', (t) => {
  const arrayVal = [123123];
  const typeArrayVal = getTypeValue(arrayVal, {
    name: 'list', typeClass: TList, valueType: { name: 'i32' }
  });
  t.is(typeArrayVal[0], 123123);
});

test('getTypeValue with base type', (t) => {
  const buffer = Buffer.from('haha');
  t.is(getTypeValue(true, { name: 'bool' }), true);
  t.is(getTypeValue(1, { name: 'byte' }), 1);
  t.is(getTypeValue(123.1, { name: 'double' }), 123.1);
  t.is(getTypeValue(12, { name: 'i16' }), 12);
  t.is(getTypeValue(231231, { name: 'i32' }), 231231);
  t.is(getTypeValue(13123131232132, { name: 'i64' }), '13123131232132');
  t.is(getTypeValue('13123131232132', { name: 'i64' }), '13123131232132');
  t.is(getTypeValue(buffer, { name: 'binary' }), buffer);
  t.is(getTypeValue('hello', { name: 'string' }), 'hello');
});

test('getTypeValue with auto convert', (t) => {
  const options = {
    autoConvert: true,
    longsAsStrings: 'off'
  };
  const buffer = Buffer.from('haha');
  t.is(getTypeValue(1, { name: 'bool' }, options), true);
  t.is(getTypeValue('1', { name: 'byte' }, options), 1);
  t.is(getTypeValue('123.1', { name: 'double' }, options), 123.1);
  t.is(getTypeValue('12', { name: 'i16' }, options), 12);
  t.is(getTypeValue('231231', { name: 'i32' }, options), 231231);
  t.is(getTypeValue(13123131232132, { name: 'i64' }, options), 13123131232132);
  t.is(getTypeValue('13123131232132', { name: 'i64' }, options), '13123131232132');
  t.is(getTypeValue(buffer, { name: 'binary' }, options), buffer);
  t.is(getTypeValue(123, { name: 'string' }, options), '123');
});

test('getTypeValue with longsAsStrings', (t) => {
  const options = {
    autoConvert: true,
    longsAsStrings: 'on'
  };

  t.is(getTypeValue(new Int64(1), { name: 'i64' }, options), '1');
  t.is(getTypeValue(new Int64('1ffffffffffffff'), { name: 'i64' }, options), '144115188075855871');
});


function MyStruct(val) {
  this.val = val;
}
