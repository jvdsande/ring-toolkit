import { stub } from 'sinon';

import { commandRegistry } from '../../src/commands/commandRegistry';
import { getLogger } from '../../src/logger/getLogger';

export function commandRegistryMock() {
  beforeEach(() => {
    // Make sure the command registry starts empty
    commandRegistry._clearCommands();
  });

  afterEach(() => {
    // Make sure the command registry finishes empty
    commandRegistry._clearCommands();
  });
}

export function loggerMock() {
  const loggerStubs = {
    log: stub(),
    warn: stub(),
    error: stub(),
    debug: stub(),
    logSyntaxError: stub(),
    group: stub(),
    groupEnd: stub(),
  };

  beforeEach(() => {
    const logger = getLogger();

    // Stub logger methods
    loggerStubs.log = stub(logger, 'log');
    loggerStubs.warn = stub(logger, 'warn');
    loggerStubs.error = stub(logger, 'error');
    loggerStubs.debug = stub(logger, 'debug');
    loggerStubs.logSyntaxError = stub(logger, 'logSyntaxError');
    loggerStubs.group = stub(logger, 'group');
    loggerStubs.groupEnd = stub(logger, 'groupEnd');
  });

  afterEach(() => {
    // Restore logger behavior
    loggerStubs.log.restore();
    loggerStubs.warn.restore();
    loggerStubs.error.restore();
    loggerStubs.debug.restore();
    loggerStubs.logSyntaxError.restore();
    loggerStubs.group.restore();
    loggerStubs.groupEnd.restore();
  });

  return loggerStubs;
}
