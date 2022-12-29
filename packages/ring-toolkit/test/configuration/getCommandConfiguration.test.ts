import { expect } from 'chai';

import { commandRegistryMock, loggerMock } from '../mocks/helpers';

import { commandRegistry } from '../../src/commands/commandRegistry';

import { getCommandConfiguration } from '../../src/configuration/getCommandConfiguration';

describe('the getCommandConfiguration function', () => {
  commandRegistryMock();
  loggerMock();

  const executable = { summary: 'test-cmd-summary', command: () => void 0, options: [] };

  it('should get the configuration for a given command', async () => {
    commandRegistry.registerCommand(executable, 'test-cmd-name');

    const configuration = {
      'test-cmd-name': {
        hello: 'world',
      },
    };

    const commandConfiguration = await getCommandConfiguration('test-cmd-name', configuration, {});

    expect(commandConfiguration).to.deep.equal({
      hello: 'world',
    });
  });

  it('should get the configuration for a given alias', async () => {
    commandRegistry.registerCommand(executable, 'test-cmd-name', 'test-cmd-alias');

    const configuration = {
      'test-cmd-alias': {
        hello: 'world',
      },
    };

    const commandConfiguration = await getCommandConfiguration('test-cmd-alias', configuration, {});

    expect(commandConfiguration).to.deep.equal({
      hello: 'world',
    });
  });

  it('should retrieve the command first and try aliases later', async () => {
    commandRegistry.registerCommand(executable, 'test-cmd-name', 'test-cmd-alias');

    const configuration = {
      'test-cmd-name': {
        hello: 'world',
      },
      'test-cmd-alias': {
        hello: 'goodbye',
      },
    };

    const commandConfiguration = await getCommandConfiguration('test-cmd-name', configuration, {});

    expect(commandConfiguration).to.deep.equal({
      hello: 'world',
    });
  });

  it('should try aliases in order and return the first match', async () => {
    commandRegistry.registerCommand(
      executable,
      'test-cmd-name',
      'test-cmd-alias-1',
      'test-cmd-alias-2',
      'test-cmd-alias-3',
    );

    const configuration = {
      'test-cmd-alias-2': {
        hello: 'world',
      },
      'test-cmd-alias-3': {
        hello: 'goodbye',
      },
    };

    const commandConfiguration = await getCommandConfiguration('test-cmd-name', configuration, {});

    expect(commandConfiguration).to.deep.equal({
      hello: 'world',
    });
  });
});
