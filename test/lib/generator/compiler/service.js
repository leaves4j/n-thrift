const test = require('ava');
const _ = require('lodash');
const serviceGenerator = require('../../../../lib/generator/compiler/service');
const { serverGenerator, clientGenerator, resultGenerator } = require('../../../../lib/generator/compiler/service');

test('serverGenerator', (t) => {
  const functions = [
    {
      name: 'testVoid',
      oneway: false,
      args: []
    },
    {
      name: 'testString',
      oneway: true,
      args: [
        {
          name: 'myAge',
          customName: 'my_age'
        }
      ]
    },
    {
      name: 'testString2',
      oneway: true,
      args: [
        {
          name: 'my_age',
          customName: 'my_age'
        },
        {
          name: 'my_name',
          customName: 'my_Name'
        }
      ]
    }];

  const options = {
    moduleFormat: 'esm'
  };

  t.snapshot(serverGenerator('Test', null, functions, options));
  const cjsOptions = {
    moduleFormat: 'cjs'
  };
  t.snapshot(serverGenerator('Test', 'Base', functions, cjsOptions));
});

test('clientGenerator', (t) => {
  const functions = [
    {
      name: 'testVoid',
      functionType: 'void',
      oneway: false,
      args: []
    },
    {
      name: 'testString',
      functionType: 'string',
      oneway: true,
      args: [
        {
          name: 'myAge',
          customName: 'my_age'
        }
      ]
    },
    {
      name: 'testString2',
      functionType: 'string',
      oneway: true,
      args: [
        {
          name: 'my_age',
          customName: 'my_age'
        },
        {
          name: 'my_name',
          customName: 'my_Name'
        }
      ]
    }];

  const options = {
    moduleFormat: 'esm',
    legacy: false
  };

  t.snapshot(clientGenerator('Test', null, functions, options));
  const legacyOptions = {
    moduleFormat: 'cjs',
    legacy: true
  };
  t.snapshot(clientGenerator('LegacyTest', 'Base', functions, legacyOptions));
});

test('resultGenerator', (t) => {
  const options = {
    moduleFormat: 'esm',
    fieldFormatter: _.camelCase
  };
  const functionsAST = [
    {
      type: 'function',
      functionType: 'void',
      identifier: 'blahBlah',
      oneway: null,
      args: [],
      throws: []
    },
    {
      type: 'function',
      functionType: 'string',
      identifier: 'secondtestString',
      oneway: null,
      args: [
        {
          id: '1',
          option: null,
          fieldType: 'string',
          identifier: 'my_thing',
          defaultValue: null
        }
      ],
      throws: [
        {
          id: '1',
          option: null,
          fieldType: 'Xception',
          identifier: 'err1',
          defaultValue: null
        }
      ]
    }
  ];

  t.snapshot(resultGenerator('Test', 'Base', functionsAST, options));
});

test('serviceGenerator', (t) => {
  const options = {
    moduleFormat: 'esm',
    fieldFormatter: _.camelCase,
    legacy: false
  };
  const functionsAST = [
    {
      type: 'function',
      functionType: 'void',
      identifier: 'blahBlah',
      oneway: null,
      args: [],
      throws: []
    },
    {
      type: 'function',
      functionType: 'string',
      identifier: 'secondtestString',
      oneway: null,
      args: [
        {
          id: '1',
          option: null,
          fieldType: 'string',
          identifier: 'my_thing',
          defaultValue: null
        }
      ],
      throws: [
        {
          id: '1',
          option: null,
          fieldType: 'Xception',
          identifier: 'err1',
          defaultValue: null
        }
      ]
    }
  ];
  t.snapshot(serviceGenerator('Test', 'Base', functionsAST, options));
  t.snapshot(serviceGenerator('Test', 'Base', functionsAST));
});

