import process from 'process';
import commandLineArgs from 'command-line-args';

import { Args } from './definitions';

export function readCliArgs(_argv = process.argv) {
  const {
    command,
    config,
    empty,
    help,
    debug: debugLogging,
    _unknown: argv = [],
  } = commandLineArgs(Args.shared, { partial: true, camelCase: true, argv: _argv }) as {
    command?: string;
    config?: string;
    empty: boolean;
    help: boolean;
    debug: boolean;
    _unknown: string[];
  };

  return {
    command,
    config,
    empty,
    help,
    debugLogging,
    argv,
  };
}
