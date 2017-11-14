const TStruct = require('../../lib/thrift/class/t_struct');
const { convertToTypedValue } = require('../../lib/thrift/utils');

let TestStruct$TypeCache = null;
const TestStruct$name = Symbol('name');
const TestStruct$age = Symbol('age');


class TestStruct extends TStruct {
  constructor(args) {
    super();
    this[TestStruct$name] = null;
    this[TestStruct$age] = null;

    if (args) {
      this.name = args.name;
      this.age = args.age;
    }
  }

  get name() { return this[TestStruct$name]; }
  set name(val) {
    this[TestStruct$name] = this[convertToTypedValue](val, { name: 'string', typeClass: null }, 'name');
  }

  get age() { return this[TestStruct$age]; }
  set age(val) {
    this[TestStruct$age] = this[convertToTypedValue](val, { name: 'i32', typeClass: null }, 'age');
  }


  static get Type() {
    if (TestStruct$TypeCache) return TestStruct$TypeCache;
    TestStruct$TypeCache = new Map(super.constructor.Type);
    TestStruct$TypeCache.set(1, { name: 'name', customName: 'name', type: { name: 'string', typeClass: null } });
    TestStruct$TypeCache.set(2, { name: 'age', customName: 'age', type: { name: 'i32', typeClass: null } });

    return TestStruct$TypeCache;
  }
}
module.exports = TestStruct;
