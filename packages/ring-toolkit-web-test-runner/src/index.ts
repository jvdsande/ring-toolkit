import { startTestRunner } from '@web/test-runner';
import { StartTestRunnerParams } from '@web/test-runner/dist/startTestRunner';
import { createExecutable } from '@ring-toolkit/executable';

export const ringToolkitWebTestRunner = createExecutable({
  options: [],
  summary: 'launch @web/test-runner, accept any additional wtr parameter',
  async command(configuration: StartTestRunnerParams | undefined, { argv }, logger) {
    logger.log('Starting @web/test-runner');

    const server = await startTestRunner(
      configuration
        ? {
            ...configuration,
            argv,
          }
        : {
            readFileConfig: true,
            readCliArgs: true,
            argv,
          },
    );

    process.addListener('exit', () => {
      server?.stop();
    });
  },
});
