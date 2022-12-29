import { expect } from 'chai';

import { readCliArgs } from '../../src/configuration/readCliArgs';

describe('the readCliArgs function', () => {
  it('should set default values for all options', () => {
    const args = readCliArgs([]);

    expect(args.command).to.be.undefined;
    expect(args.config).to.be.undefined;
    expect(args.empty).to.be.false;
    expect(args.help).to.be.false;
    expect(args.debugLogging).to.be.false;
    expect(args.argv).to.deep.equal([]);
  });

  it('should allow setting values for all options', () => {
    const args = readCliArgs([
      'test-cmd-name',
      '--config',
      'test-config-file',
      '--empty',
      '--help',
      '--debug',
    ]);

    expect(args.command).to.equal('test-cmd-name');
    expect(args.config).to.equal('test-config-file');
    expect(args.empty).to.be.true;
    expect(args.help).to.be.true;
    expect(args.debugLogging).to.be.true;
    expect(args.argv).to.deep.equal([]);
  });

  it('should pass all remaining args to the argv variable', () => {
    const args = readCliArgs(['test-cmd-name', '--help', '--some', 'value', '--flag', '--empty']);

    expect(args.command).to.equal('test-cmd-name');
    expect(args.config).to.be.undefined;
    expect(args.empty).to.be.true;
    expect(args.help).to.be.true;
    expect(args.debugLogging).to.be.false;
    expect(args.argv).to.deep.equal(['--some', 'value', '--flag']);
  });
});
