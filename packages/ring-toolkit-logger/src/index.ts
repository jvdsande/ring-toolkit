import { ErrorWithLocation, Logger } from '@web/dev-server-core';

export class RingToolkitLogger implements Logger {
  private debugLogging: boolean;

  constructor(debugLogging: boolean) {
    this.debugLogging = debugLogging;
  }

  log(...messages: unknown[]) {
    console.log(...messages);
  }

  debug(...messages: unknown[]) {
    if (this.debugLogging) {
      console.debug(...messages);
    }
  }

  error(...messages: unknown[]) {
    console.error(...messages);
  }

  warn(...messages: unknown[]) {
    console.warn(...messages);
  }

  group() {
    console.group();
  }

  groupEnd() {
    console.groupEnd();
  }

  logSyntaxError(error: ErrorWithLocation) {
    this.error(error);
  }
}
