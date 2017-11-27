const packageInfo = require('../../package.json');

module.exports = {
  packageName: packageInfo.name,
  packageVersion: packageInfo.version,
  extname: 'js',
  moduleFormat: 'cjs',
  fieldFormatter: filed => filed,
  keywords: {
    mapClass: 'TMap',
    setClass: 'TSet',
    listClass: 'TList',
    clientClass: 'TClient',
    serverClass: 'TServer',
    exceptionClass: 'TException',
    structClass: 'TStruct',
    sendSymbol: '$send',
    convertToTypedValueSymbol: '$convertToTypedValue'
  }
};
