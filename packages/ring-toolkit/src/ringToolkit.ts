import { bold, red } from 'nanocolors';

import { displayCommandHelp, displayGlobalHelp } from './configuration/displayHelp';
import { readCliArgs } from './configuration/readCliArgs';

import { registerDefaultCommands } from './commands/registerDefaultCommands';
import { executeCommand } from './commands/executeCommand';
import { commandRegistry } from './commands/commandRegistry';

import { readFileConfig } from './configuration/readFileConfig';

import { createLogger } from './logger/createLogger';
import { setLogger } from './logger/getLogger';

export async function ringToolkit() {
  // Extract main parameters from CLI arguments
  const { debugLogging, empty, help, command, config, argv } = readCliArgs();

  // Prepare logger
  const logger = createLogger({ debugLogging });
  setLogger(logger);

  // Register default commands before loading configuration
  !empty && registerDefaultCommands();

  // Load configuration, which can override default commands
  const configuration = await readFileConfig(config);

  // If no command was provided, display the global help message
  if (!command) {
    return displayGlobalHelp();
  }

  // If a command was provided, retrieve its configured executable
  const executable = commandRegistry.getExecutableForCommand(command);

  // It the executable cannot be found, exit with an error
  if (!executable) {
    logger.error(`No executable found for command ${bold(red(command))}. Exiting.`);
    process.exit(1);
  }

  // If help was required, display the command's help message
  if (help) {
    return displayCommandHelp(command, executable);
  }

  // Otherwise, execute the command
  return executeCommand(command, executable, configuration, argv);
}
