import { expect } from 'chai';

import { readCommandCliArgs } from '../../src/configuration/readCommandCliArgs';

describe('the readCommandCliArgs function', () => {
  const executable = {
    summary: '',
    command: () => void 0,
    options: [
      { name: 'flag', type: Boolean, defaultValue: false },
      { name: 'value', type: String },
      { name: 'complex-flag', type: Boolean, defaultValue: false },
      { name: 'complex-value', type: String },
    ],
  };

  it('should extract all options as-is', () => {
    const commandOptions = readCommandCliArgs(executable, [
      '--flag',
      '--value',
      'hello world',
      '--complex-flag',
      '--complex-value',
      'goodbye',
    ]);

    expect(commandOptions.flag).to.be.true;
    expect(commandOptions.value).to.equal('hello world');
    expect(commandOptions['complex-flag']).to.be.true;
    expect(commandOptions['complex-value']).to.equal('goodbye');
  });

  it('should extract all options as camel-case', () => {
    const commandOptions = readCommandCliArgs(executable, [
      '--flag',
      '--value',
      'hello world',
      '--complex-flag',
      '--complex-value',
      'goodbye',
    ]);

    expect(commandOptions.flag).to.be.true;
    expect(commandOptions.value).to.equal('hello world');
    expect(commandOptions.complexFlag).to.be.true;
    expect(commandOptions.complexValue).to.equal('goodbye');
  });

  it('should ignore all unknown options', () => {
    const commandOptions = readCommandCliArgs(executable, [
      '--flag',
      '--value',
      'hello world',
      '--complex-flag',
      '--complex-value',
      'goodbye',
      // unknown values
      '--unknown-flag',
      '--unknown-value',
      'value',
    ]);

    expect(commandOptions).to.have.keys([
      'flag',
      'value',
      'complexFlag',
      'complex-flag',
      'complexValue',
      'complex-value',
    ]);
  });
});
