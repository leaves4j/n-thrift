const thrift = require('thrift');
const TClient = require('./thrift/class/t_client');
const TServer = require('./thrift/class/t_server');
const TException = require('./thrift/class/t_exception');
const TStruct = require('./thrift/class/t_struct');
const TApplicationException = require('./thrift/class/t_application_exception');
const TList = require('./thrift/container/t_list');
const TSet = require('./thrift/container/t_set');
const TMap = require('./thrift/container/t_map');

const { convertToTypedValue } = require('./thrift/utils');


const nThrift = Object.assign({}, thrift);
nThrift.classes = {
  TClient, TServer, TException, TStruct, TApplicationException, TList, TSet, TMap
};
nThrift.symbols = {
  send: TClient.send,
  convertToTypedValue
};

module.exports = nThrift;
