import { expect } from 'chai';

import { commandRegistryMock, loggerMock } from '../mocks/helpers';
import { commandRegistry } from '../../src/commands/commandRegistry';

import { displayGlobalHelp, displayCommandHelp } from '../../src/configuration/displayHelp';

describe('the displayHelp file', () => {
  commandRegistryMock();
  const logger = loggerMock();

  const executable = { summary: 'test-cmd-summary', command: () => void 0, options: [] };

  describe('the displayGlobalHelp function', () => {
    it('should log a message to the console', () => {
      expect(logger.log.calledOnce).to.be.false;

      displayGlobalHelp();

      expect(logger.log.calledOnce).to.be.true;
    });

    it('should present Ring Toolkit', () => {
      displayGlobalHelp();

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('Ring Toolkit');
    });

    it('should display basic usage', () => {
      displayGlobalHelp();

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('Usage');
      expect(message).to.include('$ ring-toolkit');
    });

    it('should display command usage', () => {
      displayGlobalHelp();

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('Available Commands');
    });

    it('should display an helper message when no commands are registered', () => {
      displayGlobalHelp();

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('No command available.');
    });

    it('should display the name and summary of a registered command', () => {
      commandRegistry.registerCommand(
        { summary: 'test-cmd-summary', command: () => void 0, options: [] },
        'test-cmd-name',
        'test-cmd-alias',
      );

      displayGlobalHelp();

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('test-cmd-name');
      expect(message).to.include('test-cmd-summary');
      expect(message).to.include('test-cmd-alias');
    });

    it('should display a section about getting command specific help', () => {
      commandRegistry.registerCommand(
        { summary: 'test-cmd-summary', command: () => void 0, options: [] },
        'test-cmd-name',
        'test-cmd-alias',
      );

      displayGlobalHelp();

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('For more info, run any command with the --help flag');
      expect(message).to.include('$ ring-toolkit test-cmd-name --help');
    });

    it('should list shared options', () => {
      displayGlobalHelp();

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('Options');
      expect(message).to.include('-c');
      expect(message).to.include('--config');
      expect(message).to.include('-e');
      expect(message).to.include('--empty');
      expect(message).to.include('-h');
      expect(message).to.include('--help');
      expect(message).to.include('--debug');
    });
  });

  describe('the displayCommandHelp function', () => {
    it('should log a message to the console', () => {
      expect(logger.log.calledOnce).to.be.false;

      displayCommandHelp('test-cmd-name', executable);

      expect(logger.log.calledOnce).to.be.true;
    });

    it('should present Ring Toolkit', () => {
      displayCommandHelp('test-cmd-name', executable);

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('Ring Toolkit');
    });

    it('should display command usage', () => {
      displayCommandHelp('test-cmd-name', executable);

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('Command: test-cmd-name');
      expect(message).to.include('test-cmd-summary');
    });

    it('should list command options', () => {
      displayCommandHelp('test-cmd-name', {
        ...executable,
        options: [{ name: 'test-option', alias: 't', description: 'test-option-description' }],
      });

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('Command options');
      expect(message).to.include('--test-option');
      expect(message).to.include('-t');
      expect(message).to.include('test-option-description');
    });

    it('should list shared options', () => {
      displayCommandHelp('test-cmd-name', executable);

      const message = logger.log.lastCall.firstArg;

      expect(message).to.include('Shared options');
      expect(message).to.include('-c');
      expect(message).to.include('--config');
      expect(message).to.include('-e');
      expect(message).to.include('--empty');
      expect(message).to.include('-h');
      expect(message).to.include('--help');
      expect(message).to.include('--debug');
    });
  });
});
