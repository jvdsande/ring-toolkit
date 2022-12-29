import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { RingToolkitLogger } from '@ring-toolkit/logger';

export interface Executable<Configuration = any, Options = any> {
  options: (commandLineArgs.OptionDefinition & commandLineUsage.OptionDefinition)[];
  summary: string;
  command: (
    configuration: Configuration,
    optionsAndArgv: { options: Options; argv: string[] },
    logger: RingToolkitLogger,
  ) => void | Promise<void>;
}

export function createExecutable<Configuration = any, Options = any>(
  executableOptions: Omit<Executable<Configuration, Options>, 'options'> &
    Pick<Partial<Executable<Configuration, Options>>, 'options'>,
): Executable<Configuration, Options> {
  return {
    ...executableOptions,
    options: executableOptions.options ?? [],
  };
}
