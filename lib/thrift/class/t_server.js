const TApplicationException = require('./t_application_exception');
const { ThriftType, MessageType, TApplicationExceptionType } = require('../type');
const { read } = require('../reader');
const { write } = require('../writer');

const option = Symbol('TServer.option');
const typeMap = new Map();
/**
 * server base client
 * @class TServer
 */
class TServer {
  constructor(serverOption) {
    this[option] = serverOption;
  }

  /**
   * process client request
   * @param {Object} inputProtocol
   * @param {Object} outProtocol
   */
  process(inputProtocol, outProtocol) {
    const { fname: functionName, rseqid: sequenceId } = inputProtocol.readMessageBegin();

    const functionType = this.constructor.Type.get(functionName);
    if (functionType === undefined) {
      inputProtocol.skip(ThriftType.STRUCT);
      inputProtocol.readMessageEnd();
      const error = new TApplicationException(TApplicationExceptionType.UNKNOWN_METHOD, `Unknown function ${functionName}`);
      outProtocol.writeMessageBegin(functionName, MessageType.EXCEPTION, sequenceId);
      error.write(outProtocol);
      outProtocol.writeMessageEnd();
      outProtocol.flush();
      return;
    }

    const { argumentType: ArgumentType, resultType: ResultType } = functionType;
    const argument = new ArgumentType();
    argument[read](inputProtocol);
    inputProtocol.readMessageEnd();
    const args = [];
    functionType.Type.forEach((value) => {
      args.push(argument[value.customName]);
    });

    if (functionType.oneway) {
      this[functionName](...args);
      return;
    }

    this[functionName](...args).then((res) => {
      const result = new ResultType({ success: res });
      outProtocol.writeMessageBegin(functionName, MessageType.REPLY, sequenceId);
      result[write](outProtocol);
      outProtocol.writeMessageEnd();
      outProtocol.flush();
    }).catch((e) => {
      const resultTypeMap = ResultType.Type;
      // eslint-disable-next-line no-restricted-syntax
      for (const [id, field] of resultTypeMap) {
        if (id > 0 && e instanceof field.type) {
          const result = new ResultType({ [field.customName]: e });
          outProtocol.writeMessageBegin(functionName, MessageType.REPLY, sequenceId);
          result[write](outProtocol);
          outProtocol.writeMessageEnd();
          outProtocol.flush();
          return;
        }
      }
      const result = new TApplicationException(
        TApplicationExceptionType.UNKNOWN,
        e.message
      );
      outProtocol.writeMessageBegin(functionName, MessageType.EXCEPTION, sequenceId);
      result[write](outProtocol);
      outProtocol.writeMessageEnd();
      outProtocol.flush();
    });
  }

  static get Type() { return typeMap; }
}
module.exports = TServer;
