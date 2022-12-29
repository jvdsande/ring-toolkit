import commandLineArgs from 'command-line-args';
import { Executable } from '@ring-toolkit/executable';

export function readCommandCliArgs(executable: Executable, argv: string[]): { [key: string]: any } {
  const commandOptions = {
    // Merge untouched and camel-cased option so that executable developers
    // are free to use their preferred definitions
    ...commandLineArgs(executable.options, { argv, partial: true }),
    ...commandLineArgs(executable.options, { argv, partial: true, camelCase: true }),
  };

  // We only use 'partial' because we don't care about throwing for unknown options
  // Remove unknown from the return values as we are never going to use them
  delete commandOptions._unknown;

  return commandOptions;
}
