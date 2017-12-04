/* eslint no-underscore-dangle: ["error", { "allow": ["_reqs"] }] */
const TApplicationException = require('./t_application_exception');
const { read } = require('../reader');
const { write } = require('../writer');
const { MessageType } = require('../type');

const send = Symbol('send');
const receive = Symbol('receive');
const register = Symbol('register');
const transport = Symbol('transport');
const protocolClass = Symbol('protocolClass');
const sequenceId = Symbol('sequenceId');
const newSequenceId = Symbol('newSequenceId');

const typeMap = new Map();
/**
 * base client class
 * @class TClient
 */
class TClient {
  constructor(trans, protoClass) {
    this[transport] = trans;
    this[protocolClass] = protoClass;
    this[sequenceId] = 0;
    this._reqs = {};
    this[register]();
  }

  /**
   * generate new sequence id
   */
  [newSequenceId]() {
    return ++this[sequenceId];
  }
  /**
   * send request
   * @param {string} name
   * @param {Object} args
   */
  [send](name, args) {
    const seqId = this[newSequenceId]();
    const outProtocol = new this[protocolClass](this[transport]);

    const functionType = this.constructor.Type.get(name);
    const messageType = functionType.oneway ? MessageType.ONEWAY : MessageType.CALL;
    outProtocol.writeMessageBegin(name, messageType, seqId);
    const { argumentType: ArgumentType } = functionType;
    const argument = new ArgumentType(args);
    argument[write](outProtocol);
    outProtocol.writeMessageEnd();
    this[transport].flush();

    if (functionType.oneway) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this._reqs[seqId] = function sendCallback(error, result) {
        if (error) return reject(error);
        return resolve(result);
      };
    });
  }

  /**
   * receive response
   * @param {Object} protocol
   * @param {string} functionName
   * @param {number} messageType
   * @param {number} seqId
   */
  [receive](protocol, functionName, messageType, seqId) {
    const callback = this._reqs[seqId] || function callback() { };
    delete this._reqs[seqId];
    if (messageType === MessageType.EXCEPTION) {
      const error = new TApplicationException();
      error[read](protocol);
      protocol.readMessageEnd();
      return callback(protocol);
    }

    const { resultType: ResultType } = this.constructor.Type.get(functionName);
    const result = new ResultType();
    result[read](protocol);
    protocol.readMessageEnd();

    const isVoid = !ResultType.Type.has(0);
    if (isVoid) return callback();

    // eslint-disable-next-line no-restricted-syntax
    for (const [id, field] of ResultType.Type) {
      if (result[field.customName] !== null) {
        if (id === 0) return callback(null, result[field.customName]);
        return callback(result[field.customName]);
      }
    }

    return callback(new Error(`${functionName} failed: unknown result`));
  }

  /**
   * init register
   */
  [register]() {
    this.constructor.Type.forEach((type, funcName) => {
      Reflect.defineProperty(this, `recv_${funcName}`, {
        enumerable: false,
        value: (protocol, messageType, seqId) => {
          this[receive].call(this, protocol, funcName, messageType, seqId);
        }
      });
    });
  }

  /**
   * @type {Map}
   */
  static get Type() { return typeMap; }
}
module.exports = TClient;
module.exports.send = send;
module.exports.receive = receive;
