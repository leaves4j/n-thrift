const { ThriftType } = require('../../../lib/thrift/type');

class TProtocol {
  constructor() {
    this.data = [];
    this.cursor = 0;
  }
  flush() {

  }
  writeMessageBegin(fname, ftype, rseqid) {
    this.data.push({
      flag: 'MessageBegin',
      fname,
      ftype,
      rseqid
    });
  }
  writeMessageEnd() {
    this.data.push({ flag: 'MessageBegin' });
  }
  writeStructBegin(fname) {
    this.data.push({ flag: 'StructBegin', fname });
  }
  writeStructEnd() {
    this.data.push({ flag: 'StructEnd' });
  }
  writeFieldBegin(fname, ftype, fid) {
    this.data.push({
      flag: 'FieldBegin', fname, ftype, fid
    });
  }
  writeFieldEnd() {
    this.data.push({ flag: 'FieldEnd' });
  }
  writeFieldStop() {
  }
  writeMapBegin(ktype, vtype, size) {
    this.data.push({
      flag: 'MapBegin', ktype, vtype, size
    });
  }
  writeMapEnd() {
    this.data.push({ flag: 'MapEnd' });
  }
  writeListBegin(etype, size) {
    this.data.push({ flag: 'ListBegin', etype, size });
  }
  writeListEnd() {
    this.data.push({ flag: 'ListEnd' });
  }
  writeSetBegin(etype, size) {
    this.data.push({ flag: 'SetBegin', etype, size });
  }
  writeSetEnd() {
    this.data.push({ flag: 'SetEnd' });
  }
  writeBool(bool) {
    this.data.push(bool);
  }
  writeByte(b) {
    this.data.push(b);
  }
  writeI16(i16) {
    this.data.push(i16);
  }
  writeI32(i32) {
    this.data.push(i32);
  }
  writeI64(i64) {
    this.data.push(i64);
  }
  writeDouble(dbl) {
    this.data.push(dbl);
  }
  writeString(arg) {
    this.data.push(arg);
  }
  writeBinary(arg) {
    this.data.push(arg);
  }
  readMessageBegin() {
    const {
      fname, ftype, rseqid, flag
    } = this.data[this.cursor];
    if (flag !== 'MessageBegin') throw new Error('except MessageBegin');
    this.cursor++;
    return { fname, ftype, rseqid };
  }
  readMessageEnd() {
    const { flag } = this.data[this.cursor];
    if (flag !== 'MessageEnd') throw new Error('except MessageEnd');
    this.cursor++;
  }
  readStructBegin() {
    const {
      fname, flag
    } = this.data[this.cursor];
    if (flag !== 'StructBegin') throw new Error('except StructBegin');
    this.cursor++;
    return { fname };
  }
  readStructEnd() {
    const { flag } = this.data[this.cursor];
    if (flag !== 'StructEnd') throw new Error('except StructEnd');
    this.cursor++;
  }
  readFieldBegin() {
    const {
      fname, ftype, fid, flag
    } = this.data[this.cursor];
    if (flag !== 'FieldBegin') throw new Error('except FieldBegin');
    this.cursor++;
    return { fname, ftype, fid };
  }
  readFieldEnd() {
    const { flag } = this.data[this.cursor];
    if (flag !== 'FieldEnd') throw new Error('except FieldEnd');
    this.cursor++;
  }
  readMapBegin() {
    const {
      ktype, vtype, size, flag
    } = this.data[this.cursor];
    if (flag !== 'MapBegin') throw new Error('except MapBegin');
    this.cursor++;
    return { ktype, vtype, size };
  }
  readMapEnd() {
    const { flag } = this.data[this.cursor];
    if (flag !== 'MapEnd') throw new Error('except MapEnd');
    this.cursor++;
  }
  readListBegin() {
    const {
      etype, size, flag
    } = this.data[this.cursor];
    if (flag !== 'ListBegin') throw new Error('except ListBegin');
    this.cursor++;
    return { etype, size };
  }
  readListEnd() {
    const { flag } = this.data[this.cursor];
    if (flag !== 'ListEnd') throw new Error('except ListEnd');
    this.cursor++;
  }
  readSetBegin() {
    const {
      etype, size, flag
    } = this.data[this.cursor];
    if (flag !== 'SetBegin') throw new Error('except SetBegin');
    this.cursor++;
    return { etype, size };
  }
  readSetEnd() {
    const { flag } = this.data[this.cursor];
    if (flag !== 'SetEnd') throw new Error('except SetEnd');
    this.cursor++;
  }
  readBool() {
    return this.data[this.cursor++];
  }
  readByte() {
    return this.data[this.cursor++];
  }
  readI16() {
    return this.data[this.cursor++];
  }
  readI32() {
    return this.data[this.cursor++];
  }
  readI64() {
    return this.data[this.cursor++];
  }
  readDouble() {
    return this.data[this.cursor++];
  }
  readBinary() {
    return this.data[this.cursor++];
  }
  readString() {
    return this.data[this.cursor++];
  }
  getTransport() {
    return this.data[this.cursor++];
  }
  skip(type) {
    if (type === ThriftType.LIST) {
      let count = 1;
      this.cursor++;
      while (count > 0 && this.cursor <= this.data.length) {
        const item = this.data[this.cursor];
        if (typeof item === 'object' && item.flag === 'ListStart') count++;
        if (typeof item === 'object' && item.flag === 'ListEnd') count--;
        this.cursor++;
      }
    } else if (type === ThriftType.MAP) {
      let count = 1;
      this.cursor++;
      while (count > 0 && this.cursor <= this.data.length) {
        const item = this.data[this.cursor];
        if (typeof item === 'object' && item.flag === 'MapStart') count++;
        if (typeof item === 'object' && item.flag === 'MapEnd') count--;
        this.cursor++;
      }
    } else if (type === ThriftType.SET) {
      let count = 1;
      this.cursor++;
      while (count > 0 && this.cursor <= this.data.length) {
        const item = this.data[this.cursor];
        if (typeof item === 'object' && item.flag === 'SetStart') count++;
        if (typeof item === 'object' && item.flag === 'SetEnd') count--;
        this.cursor++;
      }
    } else {
      this.cursor = this.cursor + 3;
    }
  }
}
module.exports = TProtocol;
