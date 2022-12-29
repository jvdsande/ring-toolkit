import path from 'path';
import cors from '@koa/cors';
import { DevServerConfig } from '@web/dev-server';
import { StartDevServerParams } from '@web/dev-server/dist/startDevServer';

import { createExecutable } from '@ring-toolkit/executable';
import { ringToolkitWebDevServer } from '@ring-toolkit/web-dev-server';

interface ServeOptions {
  rootDir?: string;
  cors?: string | boolean;
  spa?: string | boolean;
  sslKey?: string;
  sslCert?: string;
}

function convertFalsyToBoolean(options: ServeOptions, key: 'cors' | 'spa') {
  if (options[key] === undefined) {
    options[key] = false;
  }

  if (options[key] === null) {
    options[key] = true;
  }
}

export const ringToolkitServe = createExecutable({
  options: [
    {
      name: 'root-dir',
      defaultOption: true,
    },
    {
      name: 'cors',
      alias: 'C',
      defaultValue: false,
      description: 'Enable CORS (default false)',
      type: String,
      typeLabel: '{underline [string|boolean]}',
    },
    {
      name: 'spa',
      alias: 'S',
      defaultValue: false,
      description: 'Enable SPA fallback to index.html (default false)',
      type: String,
      typeLabel: '{underline [string|boolean]}',
    },
    { name: 'ssl-key', description: 'Path to SSL key. Enables SSL', typeLabel: '{underline path}' },
    {
      name: 'ssl-cert',
      description: 'Path to SSL cert. Enables SSL',
      typeLabel: '{underline path}',
    },
  ],
  summary:
    'launch @web/dev-server configured for static serving, accept any additional wds parameter',
  async command(
    configuration: StartDevServerParams | undefined,
    { argv, options }: { argv: string[]; options: ServeOptions },
    logger,
  ) {
    logger.log('Preparing static serve options');

    const paramsConfig: DevServerConfig = {};

    // Convert cors/spa options to boolean if they are falsy
    convertFalsyToBoolean(options, 'spa');
    convertFalsyToBoolean(options, 'cors');

    if (options.rootDir) {
      paramsConfig.rootDir = options.rootDir;
    }

    if (options.cors) {
      paramsConfig.middleware = [
        cors({
          origin: options.cors === true ? '*' : options.cors,
          allowMethods: 'GET',
        }),
      ];
    }

    if (options.spa) {
      paramsConfig.appIndex = path.join(
        paramsConfig.rootDir ?? '/',
        options.spa === true ? 'index.html' : options.spa,
      );
    }

    if (options.sslKey || options.sslCert) {
      paramsConfig.http2 = true;
      paramsConfig.sslKey = options.sslKey;
      paramsConfig.sslCert = options.sslCert;
    }

    const patchedConfiguration = configuration
      ? {
          ...configuration,
          config: {
            ...configuration.config,
            ...paramsConfig,
            middleware: [
              ...(configuration.config?.middleware ?? []),
              ...(paramsConfig.middleware ?? []),
            ],
          },
          argv,
        }
      : undefined;

    await ringToolkitWebDevServer.command(patchedConfiguration, { argv, options }, logger);
  },
});
