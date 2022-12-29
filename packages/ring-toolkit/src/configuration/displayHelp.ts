import commandLineUsage from 'command-line-usage';
import { underline } from 'nanocolors';

import { Executable } from '@ring-toolkit/executable';

import { commandRegistry } from '../commands/commandRegistry';
import { getLogger } from '../logger/getLogger';

import { Args, Usage } from './definitions';

export function displayGlobalHelp() {
  const commands = commandRegistry.getCommands();
  const helpCommands = commands.slice(0, 2).map(cmd => cmd.command);

  const commandsContent = commands.length
    ? commands.map(({ command, aliases, executable }) => {
        const hasAlias = aliases.length;
        const alias = `\n Alias${aliases.length > 1 ? 'es' : ''}: `;
        const aliasString = hasAlias ? `${alias}{bold ${aliases.join(', ')}}` : '';

        return {
          name: '{bold ' + command + '}',
          summary: [...executable.summary.split('.'), aliasString, '\n'].filter(s => !!s).join('.'),
        };
      })
    : `No command available. Call ${underline('registerCommand')} to register a command.`;

  const usage = commandLineUsage([
    ...Usage.main,
    {
      header: 'Available Commands',
      content: commandsContent,
    },
    ...Usage.options(helpCommands),
  ]);

  getLogger().log(usage);
}

export function displayCommandHelp(command: string, executable: Executable) {
  const usage = commandLineUsage([
    Usage.main[0],
    {
      header: 'Command: ' + command,
      content: executable.summary,
    },
    {
      header: 'Command options',
      hide: ['command'],
      optionList: executable.options.length ? executable.options : undefined,
      content: executable.options.length ? undefined : 'No options',
    },
    {
      header: 'Shared options',
      hide: ['command'],
      optionList: Args.shared,
    },
  ]);

  getLogger().log(usage);
}
