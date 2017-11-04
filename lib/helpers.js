const { Thrift } = require('thrift');

/**
 *
 *
 * @param {string} name
 * @param {Object} ast struct ast
 *  ast:{

 *      1 -> {
 *              fieldType: "string",
 *              filedName: "message",
 *           }
 *      2 -> {
 *             fieldType: {
 *                type: "map",
 *                keyFieldType: "Numbers"
 *                valueFieldType: "UserId"
 *             },
 *             filedName: 'users'
 *           }
 *      }
 * @param {string} moduleFormat 'cjs' / 'esm'
 */
export default function readStruct(fieldMap, input, context) {
  input.readStructBegin();
  while (true) {
    const ret = input.readFieldBegin();
    const { fname, ftype, fid } = ret;
    if (ftype === Thrift.Type.STOP) {
      break;
    }
    const field = fieldMap.get(fid);
    if (field !== undefined && ftype === field.thriftType) {
      if (ftype === Thrift.Type.STRUCT) {
        context[field.fieldName] = null;
        context[field.fieldName].read(input);
      } else {
        context[field.fieldName] = input.readByte();
      }
    } else {
      input.skip(ftype);
    }
    switch (fid) {
      case 1:
        if (ftype == Thrift.Type.BYTE) {
          this.byte_thing = input.readByte();
        } else {
          input.skip(ftype);
        }
        break;
      case 2:
        if (ftype == Thrift.Type.STRUCT) {
          this.struct_thing = new ttypes.Xtruct();
          this.struct_thing.read(input);
        } else {
          input.skip(ftype);
        }
        break;
      case 3:
        if (ftype == Thrift.Type.I32) {
          this.i32_thing = input.readI32();
        } else {
          input.skip(ftype);
        }
        break;
      default:
        input.skip(ftype);
    }
    input.readFieldEnd();
  }
  input.readStructEnd();
}
