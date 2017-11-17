const TException = require('./t_exception');
const { TApplicationExceptionType } = require('../type');
const { convertToTypedValue } = require('../utils');

let typeCache = null;
const messageSymbol = Symbol('message');
const typeSymbol = Symbol('type');

class TApplicationException extends TException {
  constructor(type, message) {
    super();
    this[messageSymbol] = null;
    this[typeSymbol] = TApplicationExceptionType.UNKNOWN;
    this.message = message;
    this.type = type;
  }

  get message() { return this[messageSymbol]; }
  set message(val) {
    this[messageSymbol] = this[convertToTypedValue](val, { name: 'string', typeClass: null }, 'message');
  }

  get type() { return this[typeSymbol]; }
  set type(val) {
    this[typeSymbol] = this[convertToTypedValue](val, { name: 'i32', typeClass: null }, 'type');
  }

  static get Type() {
    if (typeCache) return typeCache;
    typeCache = new Map();
    typeCache.set(1, { name: 'message', customName: 'message', type: { name: 'string', typeClass: null } });
    typeCache.set(2, { name: 'type', customName: 'type', type: { name: 'i32', typeClass: null } });
    return typeCache;
  }
}

module.exports = TApplicationException;

