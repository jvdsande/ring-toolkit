import { expect } from 'chai';

import { commandRegistryMock, loggerMock } from '../mocks/helpers';
import { commandRegistry } from '../../src/commands/commandRegistry';

import { registerDefaultCommands } from '../../src/commands/registerDefaultCommands';

describe('the registerDefaultCommands function', () => {
  commandRegistryMock();
  loggerMock();

  it('should register all default commands', () => {
    expect(commandRegistry.getCommands()).to.be.empty;

    registerDefaultCommands();

    expect(commandRegistry.getCommands().map(cmd => cmd.command)).to.have.members([
      'dev',
      'test',
      'serve',
      'build',
    ]);
  });
});
