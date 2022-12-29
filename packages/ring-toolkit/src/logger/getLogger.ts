import { RingToolkitLogger } from '@ring-toolkit/logger';
import { createLogger } from './createLogger';

let _logger: RingToolkitLogger = createLogger({ debugLogging: false });

export function getLogger() {
  return _logger;
}

export function setLogger(logger: RingToolkitLogger) {
  _logger = logger;
}
