import { bold, green } from 'nanocolors';

import { Executable } from '@ring-toolkit/executable';

import { getLogger } from '../logger/getLogger';

import { getCommandConfiguration } from '../configuration/getCommandConfiguration';
import { readCommandCliArgs } from '../configuration/readCommandCliArgs';

export async function executeCommand(
  command: string,
  executable: Executable,
  configuration: { [key: string]: any },
  argv: string[],
) {
  const logger = getLogger();

  const commandOptions = readCommandCliArgs(executable, argv);
  const commandConfiguration = await getCommandConfiguration(
    command,
    configuration,
    commandOptions,
  );

  logger.log(`Executing command ${bold(green(command))}`);
  logger.debug(green(`Configuration found for command ${bold(command)}:`));
  logger.debug(
    green(
      JSON.stringify(
        { configuration: commandConfiguration, options: commandOptions, arguments: argv },
        null,
        2,
      ),
    ),
  );

  await executable.command(commandConfiguration, { options: commandOptions, argv }, logger);
}
