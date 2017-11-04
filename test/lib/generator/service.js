const test = require('ava');
const {
  serverGenerator, clientGenerator, resultGenerator,
} = require('../../../lib/generator/service');

test('serverGenerator', (t) => {
  const functions = [
    {
      name: 'testVoid',
      oneway: false,
      args: [],
    },
    {
      name: 'testString',
      oneway: true,
      args: [
        {
          name: 'myAge',
          customName: 'my_age',
        },
      ],
    },
    {
      name: 'testString2',
      oneway: true,
      args: [
        {
          name: 'my_age',
          customName: 'my_age',
        },
        {
          name: 'my_name',
          customName: 'my_Name',
        },
      ],
    }];

  const options = {
    moduleFormat: 'esm',
    legacy: false,
  };

  t.snapshot(serverGenerator('Test', functions, options));
  const legacyOptions = {
    moduleFormat: 'cjs',
    legacy: true,
  };
  t.snapshot(serverGenerator('LegacyTest', functions, legacyOptions));
});

test('clientGenerator', (t) => {
  const functions = [
    {
      name: 'testVoid',
      functionType: 'void',
      oneway: false,
      args: [],
    },
    {
      name: 'testString',
      functionType: 'string',
      oneway: true,
      args: [
        {
          name: 'myAge',
          customName: 'my_age',
        },
      ],
    },
    {
      name: 'testString2',
      functionType: 'string',
      oneway: true,
      args: [
        {
          name: 'my_age',
          customName: 'my_age',
        },
        {
          name: 'my_name',
          customName: 'my_Name',
        },
      ],
    }];

  const options = {
    moduleFormat: 'esm',
    legacy: false,
  };

  t.snapshot(clientGenerator('Test', functions, options));
  const legacyOptions = {
    moduleFormat: 'cjs',
    legacy: true,
  };
  t.snapshot(clientGenerator('LegacyTest', functions, legacyOptions));
});

test('resultGenerator', (t) => {
  const func = {
    functionType: {
      type: 'map',
      keyFieldType: 'i32',
      valueFieldType: {
        type: 'list',
        fieldType: 'Numbers',
      },
    },
    name: 'testMultiException',
    oneway: false,
    args: [],
    throws: [
      {
        id: '1',
        type: 'Xception',
        name: 'err1',
      },
      {
        id: '2',
        type: 'Xception2',
        name: 'err2',
      },
      {
        id: '3',
        type: 'Xception2',
        name: 'err2',
      },
    ],
  };
  const options = {
    moduleFormat: 'esm',
    legacy: false,
  };
  t.snapshot(resultGenerator('MyTest', func, options));

  const funcNoThrows = {
    functionType: 'string',
    name: 'testMultiException',
    oneway: false,
    args: [],
    throws: [
    ],
  };
  const optionsNoThrows = {
    moduleFormat: 'cjs',
    legacy: false,
  };
  t.snapshot(resultGenerator('MyTest', funcNoThrows, optionsNoThrows));
  const voidFunc = {
    functionType: 'void',
    name: 'testMultiException',
    oneway: false,
    args: [],
    throws: [
      {
        id: '1',
        type: 'Xception',
        name: 'err1',
      },
    ],
  };
  const voidOptions = {
    moduleFormat: 'cjs',
    legacy: false,
  };
  t.snapshot(resultGenerator('MyTest', voidFunc, voidOptions));

  const funcContainer = {
    functionType: {
      type: 'set',
      fieldType: 'string',
    },
    name: 'testMultiException',
    oneway: false,
    args: [],
    throws: [
    ],
  };
  const optionsContainer = {
    moduleFormat: 'cjs',
    legacy: false,
  };
  t.snapshot(resultGenerator('MyTest', funcContainer, optionsContainer));
});

