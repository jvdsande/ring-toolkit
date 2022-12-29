import { green, yellow } from 'nanocolors';

import { Executable } from '@ring-toolkit/executable';

import { getLogger } from '../logger/getLogger';

function CommandRegistry() {
  const commandMap = new Map<string, Executable>();
  const aliasMap = new Map<string, string[]>();

  const registry = {
    // Global registry access
    getCommands() {
      return [...commandMap.entries()].map(([command, executable]) => ({
        command,
        executable,

        aliases: registry.getAliasesForCommand(command),
      }));
    },

    // Alias management
    getAliasesForCommand(command: string) {
      return aliasMap.get(command) ?? [];
    },

    getCommandFromAlias(alias: string) {
      if (aliasMap.has(alias)) {
        return alias;
      }

      const entry = [...aliasMap.entries()].find(([, aliases]) => aliases.includes(alias));

      if (!entry) {
        return alias;
      }

      return entry[0];
    },

    // Executable management
    getExecutableForCommand(command: string): Executable | undefined {
      const realCommand = registry.getCommandFromAlias(command);

      return commandMap.get(realCommand);
    },

    // Registry management
    registerCommand(executable: Executable, command: string, ...aliases: string[]) {
      const logger = getLogger();

      if (commandMap.has(command)) {
        logger.warn('Overriding already registered command: ' + green(command));
      }

      [...aliasMap.keys()].forEach(cmd => {
        aliasMap.set(
          cmd,
          aliasMap.get(cmd)!.filter(alias => {
            if (aliases.includes(alias) && command !== cmd) {
              logger.warn(
                `Remapping alias ${yellow(alias)} from command ${yellow(cmd)} to command ${green(
                  command,
                )}`,
              );
              return false;
            }

            if (command === alias) {
              logger.warn(`Removing alias ${yellow(alias)} from command ${yellow(cmd)}`);
              return false;
            }

            return true;
          }),
        );
      });

      const cleanAliases = aliases.filter(alias => {
        if (commandMap.has(alias)) {
          logger.warn('Cannot register alias ' + yellow(alias) + ' as it is used as a command');
          return false;
        }

        return true;
      });

      commandMap.set(command, executable);
      aliasMap.set(command, cleanAliases ?? []);
    },
    _clearCommands() {
      commandMap.clear();
      aliasMap.clear();
    },
  };

  return registry;
}

export const commandRegistry = CommandRegistry();
