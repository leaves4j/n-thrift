const test = require('ava');
const {
  writeList, writeMap, writeStruct, writeFiledValue
} = require('../../../lib/thrift/writer');
const TProtocolMocker = require('../../helpers/mocker/t_protocol');
const { ThriftType } = require('../../../lib/thrift/type');
const TList = require('../../../lib/thrift/container/t_list');
const TSet = require('../../../lib/thrift/container/t_set');

test('writeFiledValue', (t) => {
  const protocol = new TProtocolMocker();
  writeFiledValue(123, ThriftType.I32, 'i32', protocol);
  t.deepEqual(protocol.data, [123]);
});
test('writeStruct', (t) => {
  const protocol = new TProtocolMocker();
  const fieldMap = new Map();
  fieldMap.set(1, { name: 'bonks', customName: 'BONKS', type: { name: 'list', typeClass: TList, valueType: { name: 'i32', typeClass: null } } });
  fieldMap.set(2, { name: 'bonk', customName: 'BONK', type: { name: 'string', typeClass: null } });
  fieldMap.set(4, { name: 'newshort', customName: 'NEWSHORT', type: { name: 'i16', typeClass: null } });
  fieldMap.set(5, { name: 'my_set', customName: 'MY_SET', type: { name: 'set', type: TSet, valueType: { name: 'string' } } });

  const context = {
    BONKS: new TList([1], { name: 'i32' }),
    BONK: 'book',
    NEWSHORT: 2,
    MY_SET: new TSet(['hahahah', 'qwe'], { name: 'string' })
  };
  writeStruct(fieldMap, protocol, context);
  t.deepEqual(protocol.data, [123]);
});
