import { commandRegistry } from '../commands/commandRegistry';
import { getAliasConfiguration } from './getAliasConfiguration';

export async function getCommandConfiguration(
  command: string,
  configuration: any,
  commandOptions: any,
) {
  const realCommand = commandRegistry.getCommandFromAlias(command);

  const aliases = [realCommand, ...commandRegistry.getAliasesForCommand(realCommand)];

  for (const alias of aliases) {
    const commandConfiguration = await getAliasConfiguration(configuration, alias, commandOptions);

    if (commandConfiguration) {
      return commandConfiguration;
    }
  }
}
