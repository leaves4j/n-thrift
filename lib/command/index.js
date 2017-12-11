const path = require('path');
const Command = require('common-bin');
const pkg = require('../../package.json');
const generator = require('../generator');

class MainCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = `Usage: ${pkg.name} compile <fileDir> [options]`;
    this.version = pkg.version;
    this.options = {
      output: {
        description: 'output dirname',
        alias: ['o'],
        type: 'string',
        default: '.',
        requiresArg: true
      },
      module: {
        description: 'javascript module system, default to \'cjs\'',
        alias: ['m'],
        type: 'string',
        default: 'cjs'
      },
      extname: {
        description: 'file extname',
        alias: ['e'],
        type: 'string',
        default: 'js'
      }
    };
  }
  /* eslint-disable class-methods-use-this */
  run({ cwd, argv }) {
    const { module, output, extname } = argv;
    const thriftPath = path.resolve(cwd, argv._[0]);
    const outPath = path.resolve(cwd, output);
    console.log({ module, output, extname });
    return generator(thriftPath, outPath, { moduleFormat: module, extname });
  }
}

module.exports = MainCommand;
