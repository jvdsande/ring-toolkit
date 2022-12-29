import { startDevServer } from '@web/dev-server';
import { StartDevServerParams } from '@web/dev-server/dist/startDevServer';
import { createExecutable } from '@ring-toolkit/executable';

export const ringToolkitWebDevServer = createExecutable({
  options: [],
  summary: 'launch @web/dev-server, accept any additional wds parameter',
  async command(configuration: StartDevServerParams | undefined, { argv }, logger) {
    logger.log('Starting @web/dev-server');

    const server = await startDevServer(
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
      server.stop();
    });
  },
});
