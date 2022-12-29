import { expect } from 'chai';
import { SinonSpyCall } from 'sinon';

import { commandRegistryMock, loggerMock } from '../mocks/helpers';

import { commandRegistry } from '../../src/commands/commandRegistry';

describe('the command registry', () => {
  commandRegistryMock();
  const logger = loggerMock();

  const executable = { summary: '', command: () => void 0, options: [] };

  describe('the getCommands method', () => {
    it('should return an empty array when no commands are registered', () => {
      expect(commandRegistry.getCommands()).to.be.empty;
    });

    it('should return all commands with their known aliases and executable', () => {
      commandRegistry.registerCommand(executable, 'test1', 'alias1-A');
      commandRegistry.registerCommand(executable, 'test2', 'alias2-A', 'alias2-B');

      expect(commandRegistry.getCommands()).to.have.deep.members([
        { command: 'test1', aliases: ['alias1-A'], executable },
        { command: 'test2', aliases: ['alias2-A', 'alias2-B'], executable },
      ]);
    });
  });

  describe('the getAliasesForCommand method', () => {
    it('should return the aliases for a given command', () => {
      commandRegistry.registerCommand(executable, 'test1', 'alias1-A');
      commandRegistry.registerCommand(executable, 'test2', 'alias2-A', 'alias2-B');

      expect(commandRegistry.getAliasesForCommand('test1')).to.have.members(['alias1-A']);
      expect(commandRegistry.getAliasesForCommand('test2')).to.have.members([
        'alias2-A',
        'alias2-B',
      ]);
    });

    it('should return an empty array for an unknown command', () => {
      expect(commandRegistry.getAliasesForCommand('unknown')).to.be.empty;
    });

    it('should return an empty array if passed command is a known alias', () => {
      commandRegistry.registerCommand(executable, 'test1', 'alias1-A');
      commandRegistry.registerCommand(executable, 'test2', 'alias2-A', 'alias2-B');

      expect(commandRegistry.getAliasesForCommand('alias1-A')).to.be.empty;
      expect(commandRegistry.getAliasesForCommand('alias2-B')).to.be.empty;
    });
  });

  describe('the getCommandFromAlias method', () => {
    it('should return the correct command for a given alias', () => {
      commandRegistry.registerCommand(executable, 'test1', 'alias1-A');
      commandRegistry.registerCommand(executable, 'test2', 'alias2-A', 'alias2-B');

      expect(commandRegistry.getCommandFromAlias('alias1-A')).to.equal('test1');
      expect(commandRegistry.getCommandFromAlias('alias2-A')).to.equal('test2');
      expect(commandRegistry.getCommandFromAlias('alias2-B')).to.equal('test2');
    });

    it("should return the passed command if it's already a main command", () => {
      commandRegistry.registerCommand(executable, 'test1', 'alias1-A');
      commandRegistry.registerCommand(executable, 'test2', 'alias2-A', 'alias2-B');

      expect(commandRegistry.getCommandFromAlias('test1')).to.equal('test1');
      expect(commandRegistry.getCommandFromAlias('test2')).to.equal('test2');
    });

    it('should return the passed command if it is unknown', () => {
      expect(commandRegistry.getCommandFromAlias('unknown')).to.equal('unknown');
    });
  });

  describe('the getExecutableForCommand method', () => {
    it('should return the correct executable for a given command', () => {
      const execOne = { ...executable };
      const execTwo = { ...executable };

      commandRegistry.registerCommand(execOne, 'test1', 'alias1-A');
      commandRegistry.registerCommand(execTwo, 'test2', 'alias2-A', 'alias2-B');

      expect(commandRegistry.getExecutableForCommand('test1')).to.equal(execOne);
      expect(commandRegistry.getExecutableForCommand('test2')).to.equal(execTwo);
    });

    it('should return undefined for an unknown command', () => {
      expect(commandRegistry.getExecutableForCommand('unknown')).to.be.undefined;
    });
  });

  describe('the registerCommand method', () => {
    it('should add a new command to the registry', () => {
      expect(commandRegistry.getCommands().length).to.equal(0);

      commandRegistry.registerCommand(executable, 'cmd');

      expect(commandRegistry.getCommands().length).to.equal(1);
      expect(commandRegistry.getCommands()[0].command).to.equal('cmd');
    });

    it('should allow registering aliases for a command', () => {
      expect(commandRegistry.getAliasesForCommand('cmd')).to.be.empty;

      commandRegistry.registerCommand(executable, 'cmd', 'alias1', 'alias2');

      expect(commandRegistry.getAliasesForCommand('cmd')).to.have.members(['alias1', 'alias2']);
    });

    it('should warn the user when registering a command already in use', () => {
      const execOne = { ...executable };
      const execTwo = { ...executable };

      commandRegistry.registerCommand(execOne, 'cmd');

      expect(commandRegistry.getExecutableForCommand('cmd')).to.equal(execOne);
      expect(logger.warn.callCount).to.equal(0);

      commandRegistry.registerCommand(execTwo, 'cmd');

      expect(commandRegistry.getExecutableForCommand('cmd')).to.equal(execTwo);
      expect(logger.warn.callCount).to.equal(1);
      expect(logger.warn.lastCall.firstArg).to.include('Overriding already registered command');
    });

    it('should warn the user when remapping an alias to a new command', () => {
      commandRegistry.registerCommand(executable, 'cmd1', 'alias');

      expect(commandRegistry.getCommandFromAlias('alias')).to.equal('cmd1');
      expect(logger.warn.callCount).to.equal(0);

      commandRegistry.registerCommand(executable, 'cmd2', 'alias');

      expect(commandRegistry.getCommandFromAlias('alias')).to.equal('cmd2');
      expect(logger.warn.callCount).to.equal(1);
      expect(logger.warn.lastCall.firstArg).to.include('Remapping alias');
    });

    it('should not warn about remapping if the new command is the same', () => {
      const findRemappingComment = (call: SinonSpyCall) =>
        call.firstArg.startsWith('Remapping alias');

      commandRegistry.registerCommand(executable, 'cmd1', 'alias');

      expect(commandRegistry.getCommandFromAlias('alias')).to.equal('cmd1');
      expect(logger.warn.getCalls().filter(findRemappingComment)).to.be.empty;

      commandRegistry.registerCommand(executable, 'cmd1', 'alias');

      expect(commandRegistry.getCommandFromAlias('alias')).to.equal('cmd1');
      expect(logger.warn.getCalls().filter(findRemappingComment)).to.be.empty;
    });

    it('should warn the user when registering a command that was previously an alias', () => {
      commandRegistry.registerCommand(executable, 'cmd', 'alias');

      expect(commandRegistry.getCommandFromAlias('alias')).to.equal('cmd');
      expect(logger.warn.callCount).to.equal(0);

      commandRegistry.registerCommand(executable, 'alias');

      expect(commandRegistry.getCommandFromAlias('alias')).to.equal('alias');
      expect(logger.warn.callCount).to.equal(1);
      expect(logger.warn.lastCall.firstArg).to.include('Removing alias');
    });

    it('should warn the user that an alias cannot be set if it already is a command', () => {
      commandRegistry.registerCommand(executable, 'cmd1');

      expect(commandRegistry.getCommandFromAlias('cmd1')).to.equal('cmd1');
      expect(logger.warn.callCount).to.equal(0);

      commandRegistry.registerCommand(executable, 'cmd2', 'cmd1');

      expect(commandRegistry.getCommandFromAlias('cmd1')).to.equal('cmd1');
      expect(logger.warn.callCount).to.equal(1);
      expect(logger.warn.lastCall.firstArg).to.include('Cannot register alias');
    });
  });
});
