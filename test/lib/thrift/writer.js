const test = require('ava');
const {
  writeList, writeMap, writeStruct, writeFiledValue
} = require('../../../lib/thrift/writer');
const TProtocolMocker = require('../../helpers/mocker/t_protocol');
const { ThriftType } = require('../../../lib/thrift/type');
const TMap = require('../../../lib/thrift/container/t_map');
const TList = require('../../../lib/thrift/container/t_list');
const TSet = require('../../../lib/thrift/container/t_set');

test('writeFiledValue', (t) => {
  const protocol = new TProtocolMocker();
  writeFiledValue(true, ThriftType.BOOL, 'bool', protocol);
  t.deepEqual(protocol.data, [true]);

  protocol.data = [];
  writeFiledValue(1, ThriftType.BYTE, 'byte', protocol);
  t.deepEqual(protocol.data, [1]);

  protocol.data = [];
  writeFiledValue(123, ThriftType.I16, 'i16', protocol);
  t.deepEqual(protocol.data, [123]);

  protocol.data = [];
  writeFiledValue(123123, ThriftType.I32, 'i32', protocol);
  t.deepEqual(protocol.data, [123123]);

  protocol.data = [];
  writeFiledValue(1231231231, ThriftType.I64, 'i64', protocol);
  t.deepEqual(protocol.data, [1231231231]);

  protocol.data = [];
  writeFiledValue(123.23, ThriftType.DOUBLE, 'double', protocol);
  t.deepEqual(protocol.data, [123.23]);

  protocol.data = [];
  writeFiledValue('hello', ThriftType.STRING, 'string', protocol);
  t.deepEqual(protocol.data, ['hello']);
  protocol.data = [];
  const buffer = Buffer.from('hello word');
  writeFiledValue(buffer, ThriftType.STRING, 'binary', protocol);
  t.deepEqual(protocol.data, [buffer]);
});

test('writeStruct', (t) => {
  const protocol = new TProtocolMocker();
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

  const context = {
    BONKS: new TList([1], { name: 'i32' }),
    BONK: 'book',
    NEWSHORT: 2,
    MY_SET: new TSet(['hahahah', 'qwe'], { name: 'string' }),
    MY_MAP: new TMap([[1, 'a'], [2, 'b'], [3, 'c']], { name: 'i32' }, { name: 'string' })
  };
  writeStruct(fieldMap, protocol, context);
  const result = [
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
      flag: 'FieldBegin', ftype: ThriftType.STOP
    },
    { flag: 'StructEnd' }];

  t.deepEqual(protocol.data, result);
});
