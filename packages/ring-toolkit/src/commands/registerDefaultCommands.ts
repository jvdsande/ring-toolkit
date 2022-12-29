import { ringToolkitWebDevServer } from '@ring-toolkit/web-dev-server';
import { ringToolkitWebTestRunner } from '@ring-toolkit/web-test-runner';
import { ringToolkitRollup } from '@ring-toolkit/rollup';
import { ringToolkitServe } from '@ring-toolkit/serve';

import { commandRegistry } from './commandRegistry';

export function registerDefaultCommands() {
  commandRegistry.registerCommand(
    ringToolkitWebDevServer,
    'dev',
    'start',
    'wds',
    'web-dev-server',
    '@web/dev-server',
  );
  commandRegistry.registerCommand(
    ringToolkitWebTestRunner,
    'test',
    'wtr',
    'web-test-runner',
    '@web/test-runner',
  );
  commandRegistry.registerCommand(ringToolkitServe, 'serve', 'static');
  commandRegistry.registerCommand(ringToolkitRollup, 'build', 'rollup', 'bundle');
}
