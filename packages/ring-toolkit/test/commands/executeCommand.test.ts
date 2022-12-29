import { expect } from 'chai';
import { restore, stub } from 'sinon';

import { commandRegistryMock, loggerMock } from '../mocks/helpers';

import { executeCommand } from '../../src/commands/executeCommand';

describe('the executeCommand function', () => {
  commandRegistryMock();
  const logger = loggerMock();

  afterEach(() => {
    restore();
  });

  it('should log the name of the command', async () => {
    await executeCommand('my-command', { command: stub(), summary: '', options: [] }, {}, []);

    expect(logger.log.calledOnce).to.be.true;
    expect(logger.log.lastCall.firstArg).to.include('my-command');
  });

  it('should log as debug the configuration found for the command', async () => {
    await executeCommand(
      'my-command',
      { command: stub(), summary: '', options: [] },
      {
        'my-command': { hello: 'world' },
        'other-command': { goodbye: 'world' },
      },
      [],
    );

    expect(logger.debug.calledTwice).to.be.true;
    expect(logger.debug.firstCall.firstArg).to.include('my-command');
    expect(logger.debug.lastCall.firstArg).to.include('"hello": "world"');
    expect(logger.debug.lastCall.firstArg).to.not.include('"goodbye": "world"');
  });

  it('should run the executable with the correct options', async () => {
    const commandStub = stub();

    await executeCommand(
      'my-command',
      {
        command: commandStub,
        summary: '',
        options: [
          {
            name: 'test',
            type: String,
          },
          {
            name: 'complex-name',
            type: Boolean,
          },
        ],
      },
      {
        'my-command': { hello: 'world' },
        'other-command': { goodbye: 'world' },
      },
      ['--test', 'hello-world', '--complex-name'],
    );

    expect(commandStub.calledOnce).to.be.true;
    expect(commandStub.lastCall.args[0]).to.deep.equal({
      hello: 'world',
    });
    expect(commandStub.lastCall.args[1].options).to.deep.equal({
      test: 'hello-world',
      'complex-name': true,
      complexName: true,
    });
    expect(commandStub.lastCall.args[1].argv).to.deep.equal([
      '--test',
      'hello-world',
      '--complex-name',
    ]);
  });
});
