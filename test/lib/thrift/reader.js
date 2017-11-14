const test = require('ava');
const {
  readField, readStruct, readList, readMap, readSet
} = require('../../../lib/thrift/reader');
const TProtocolMocker = require('../../helpers/mocker/t_protocol');
const { ThriftType } = require('../../../lib/thrift/type');
const TMap = require('../../../lib/thrift/container/t_map');
const TList = require('../../../lib/thrift/container/t_list');
const TSet = require('../../../lib/thrift/container/t_set');
const TestStruct = require('../../helpers/test_struct');

test('readField', (t) => {
  const protocol = new TProtocolMocker();
  const buffer = Buffer.from('hello word');
  protocol.data = [true, 0, 10, 123123, 123123123, 123.123, 'hello', buffer];

  t.is(readField(ThriftType.BOOL, { name: 'bool' }, protocol), true);
  t.is(readField(ThriftType.BYTE, { name: 'byte' }, protocol), 0);
  t.is(readField(ThriftType.I16, { name: 'i16' }, protocol), 10);
  t.is(readField(ThriftType.I32, { name: 'i32' }, protocol), 123123);
  t.is(readField(ThriftType.I64, { name: 'i64' }, protocol), 123123123);
  t.is(readField(ThriftType.DOUBLE, { name: 'double' }, protocol), 123.123);
  t.is(readField(ThriftType.STRING, { name: 'string' }, protocol), 'hello');
  t.is(readField(ThriftType.STRING, { name: 'binary' }, protocol), buffer);
});

test('readList', (t) => {
  const protocol = new TProtocolMocker();
  protocol.data = [
    { flag: 'ListBegin', etype: ThriftType.I32, size: 2 },
    1,
    2,
    { flag: 'ListEnd' }
  ];
  const list = [];
  readList({ name: 'i32', typeClass: null }, protocol, list);
  t.deepEqual(list, [1, 2]);
});

test('readSet', (t) => {
  const protocol = new TProtocolMocker();
  protocol.data = [
    { flag: 'SetBegin', etype: ThriftType.STRING, size: 3 },
    'a',
    'b',
    'c',
    { flag: 'SetEnd' }
  ];
  const set = new Set();
  readSet({ name: 'string', typeClass: null }, protocol, set);
  t.true(set.has('a'));
  t.true(set.has('b'));
  t.true(set.has('c'));
});

test('readMap', (t) => {
  const protocol = new TProtocolMocker();
  protocol.data = [
    {
      flag: 'MapBegin', ktype: ThriftType.I32, vtype: ThriftType.STRING, size: 2
    },
    1,
    'a',
    2,
    'b',
    { flag: 'MapEnd' }
  ];
  const map = new Map();
  readMap({ name: 'i32', typeClass: null }, { name: 'string', typeClass: null }, protocol, map);
  t.is(map.get(1), 'a');
  t.is(map.get(2), 'b');
});

test('readStruct', (t) => {
  const fieldMap = new Map();
  fieldMap.set(1, { name: 'bonks', customName: 'BONKS', type: { name: 'list', typeClass: TList, valueType: { name: 'i32', typeClass: null } } });
  fieldMap.set(2, { name: 'bonk', customName: 'BONK', type: { name: 'string', typeClass: null } });
  fieldMap.set(4, { name: 'newshort', customName: 'NEWSHORT', type: { name: 'i16', typeClass: null } });
  fieldMap.set(5, { name: 'my_set', customName: 'MY_SET', type: { name: 'set', typeClass: TSet, valueType: { name: 'string' } } });
  fieldMap.set(6, {
    name: 'my_map',
    customName: 'MY_MAP',
    type: {
      name: 'map', typeClass: TMap, keyType: { name: 'i32' }, valueType: { name: 'string' }
    }
  });
  fieldMap.set(7, { name: 'my_info', customName: 'MY_INFO', type: { name: 'struct', typeClass: TestStruct } });

  const protocol = new TProtocolMocker();
  protocol.data = [
    { flag: 'StructBegin', fname: undefined },
    {
      flag: 'FieldBegin', fname: 'bonks', ftype: ThriftType.LIST, fid: 1
    },
    { flag: 'ListBegin', etype: ThriftType.I32, size: 1 },
    1,
    { flag: 'ListEnd' },
    { flag: 'FieldEnd' },
    {
      flag: 'FieldBegin', fname: 'bonk', ftype: ThriftType.STRING, fid: 2
    },
    'book',
    { flag: 'FieldEnd' },
    {
      flag: 'FieldBegin', fname: 'newshort', ftype: ThriftType.I16, fid: 4
    },
    2,
    { flag: 'FieldEnd' },
    {
      flag: 'FieldBegin', fname: 'my_set', ftype: ThriftType.SET, fid: 5
    },
    { flag: 'SetBegin', etype: ThriftType.STRING, size: 2 },
    'hahahah',
    'qwe',
    { flag: 'SetEnd' },
    { flag: 'FieldEnd' },
    {
      flag: 'FieldBegin', fname: 'my_map', ftype: ThriftType.MAP, fid: 6
    },
    {
      flag: 'MapBegin', ktype: ThriftType.I32, vtype: ThriftType.STRING, size: 3
    },
    1,
    'a',
    2,
    'b',
    3,
    'c',
    { flag: 'MapEnd' },
    { flag: 'FieldEnd' },
    {
      flag: 'FieldBegin', fname: 'my_info', ftype: ThriftType.STRUCT, fid: 7
    },
    { flag: 'StructBegin', fname: undefined },
    {
      flag: 'FieldBegin', fname: 'name', ftype: ThriftType.STRING, fid: 1
    },
    'book',
    { flag: 'FieldEnd' },
    {
      flag: 'FieldBegin', fname: 'age', ftype: ThriftType.I32, fid: 2
    },
    18,
    { flag: 'FieldEnd' },
    { flag: 'FieldBegin', ftype: ThriftType.STOP },
    { flag: 'StructEnd' },
    { flag: 'FieldEnd' },
    { flag: 'FieldBegin', ftype: ThriftType.STOP },
    { flag: 'StructEnd' }
  ];
  const context = {};
  readStruct(fieldMap, protocol, context);
  t.true(context.BONKS instanceof TList);
  t.is(context.BONKS[0], 1);
  t.is(context.BONK, 'book');
  t.is(context.NEWSHORT, 2);
  t.true(context.MY_SET instanceof TSet);
  t.true(context.MY_SET.has('hahahah'));
  t.true(context.MY_SET.has('qwe'));
  t.true(context.MY_MAP instanceof TMap);
  t.is(context.MY_MAP.get(1), 'a');
  t.is(context.MY_MAP.get(2), 'b');
  t.is(context.MY_MAP.get(3), 'c');
  t.is(context.MY_INFO.name, 'book');
  t.is(context.MY_INFO.age, 18);
});

