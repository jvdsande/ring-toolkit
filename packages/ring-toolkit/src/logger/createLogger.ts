import { RingToolkitLogger } from '@ring-toolkit/logger';

export interface LoggerArgs {
  debugLogging: boolean;
}

export function createLogger(args: LoggerArgs): RingToolkitLogger {
  return new RingToolkitLogger(args.debugLogging);
}
