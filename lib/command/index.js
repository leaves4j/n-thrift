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

      }
    };
  }
  /* eslint-disable class-methods-use-this */
  run({ cwd, argv }) {
    const { module , output } = argv;
    const thriftPath = path.resolve(cwd, argv._[0]);
    const outPath = path.resolve(cwd, output);
    return generator(thriftPath, outPath, { moduleFormat: module });
  }
}

module.exports = MainCommand;
