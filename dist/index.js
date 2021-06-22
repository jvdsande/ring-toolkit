'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var url = require('url');
var fs = require('fs-extra');
var path = require('path');
var sade = require('sade');
var configLoader = require('@web/config-loader');
var cli$1 = require('cli');
var devServer = require('@web/dev-server');
var testRunner = require('@web/test-runner');
var childProcess = require('child_process');
var rollup = require('rollup');
var depcheck = require('depcheck');
var cors = require('@koa/cors');
var devServerRollup = require('@web/dev-server-rollup');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var url__default = /*#__PURE__*/_interopDefaultLegacy(url);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var sade__default = /*#__PURE__*/_interopDefaultLegacy(sade);
var cli__default = /*#__PURE__*/_interopDefaultLegacy(cli$1);
var childProcess__default = /*#__PURE__*/_interopDefaultLegacy(childProcess);
var depcheck__default = /*#__PURE__*/_interopDefaultLegacy(depcheck);
var cors__default = /*#__PURE__*/_interopDefaultLegacy(cors);

/**
 * Launch @web/dev-server
 * @param {object} config - loaded config
 * @returns {Promise<void>} - @web/dev-server execution
 */
async function commandDev(config) {
  // Remove ring-toolkit command from args
  const argv = process.argv.slice(3);

  cli__default['default'].info('Starting @web/dev-server');

  const server = await devServer.startDevServer(
    config
      ? {
          ...config,
          argv
        }
      : {
          readFileConfig: true,
          readCliArgs: true,
          argv
        }
  );

  process.addListener('exit', () => {
    server.stop();
  });
}

/**
 * Launch @web/test-runner
 * @param {object} config - loaded config
 * @returns {Promise<void>} - @web/test-runner execution
 */
async function commandTest(config) {
  // Remove ring-toolkit command from args
  const argv = process.argv.slice(3);

  cli__default['default'].info('Starting @web/test-runner');

  const server = await testRunner.startTestRunner(
    config
      ? {
          ...config,
          argv
        }
      : {
          readFileConfig: true,
          readCliArgs: true,
          argv
        }
  );

  process.addListener('exit', () => {
    server.stop();
  });
}

/**
 * Create the Rollup configuration from config files, then run the Rollup build
 * @param {object} config - loaded config
 * @returns {Promise<SpawnSyncReturns<Buffer>>} - Rollup build execution
 */
async function commandBuild(config) {
  if (!config) {
    cli__default['default'].info('No build config found, falling back to Rollup CLI');

    // Remove ring-toolkit command from args
    const argv = process.argv.slice(3);

    return childProcess__default['default'].spawnSync('rollup', argv, {
      stdio: 'inherit',
      shell: true
    })
  }

  cli__default['default'].info('Building using Rollup...');

  async function executeRollup(rollupConfig) {
    const bundle = await rollup.rollup({
      ...rollupConfig,
      onwarn: (warning) => {
        if (warning.plugin) {
          cli__default['default'].info(`${warning.plugin}:`);
        }
        cli__default['default'].info(warning.message);
        if (warning.id) {
          cli__default['default'].info(`In file ${warning.id}`);
        }
      }
    });

    await bundle.write(rollupConfig.output);

    await bundle.close();
  }

  try {
    if (Array.isArray(config)) {
      for (const conf of config) {
        await executeRollup(conf);
      }
    } else {
      await executeRollup(config);
    }
  } catch (err) {
    cli__default['default'].error('An error occurred during build');
    cli__default['default'].fatal(err);
  }

  cli__default['default'].ok('Build successful!');
}

/**
 * Helper function for pluralizing the "dependency" word
 * @param {number} length - number of dependencies
 * @returns {string} - pluralized word
 */
function dependencies(length) {
  if (length < 2) {
    return 'dependency'
  }

  return 'dependencies'
}

/**
 * Check if a dependency matches an array of checks
 * @param {string} dep - dependency to check
 * @param {string|RegExp|(string|RegExp)[]} match - checks to run
 * @returns {boolean} - whether the dep matches
 */
function depMatches(dep, match) {
  if (Array.isArray(match)) {
    return match.some((m) => depMatches(dep, m))
  }

  if (typeof match === 'string') {
    return dep.startsWith('string')
  }

  return match.test(dep)
}

/**
 * Helper function for filtering explicit imports of an aliased dep's subdependencies
 * Checks that @egg/web is present in this case
 * @param {string[]} missing - missing dependencies to filter
 * @param {string[]} installed - installed dependencies
 * @param {string} alias - aliased dependency
 * @param {RegExp|string|(RegExp|string)[]} match - values alias
 * @returns {string[]} - filtered dependencies
 */
function detectAlias(missing, installed, alias, match) {
  const missingOutsideAlias = missing.filter((dep) => !depMatches(dep, match));

  if (missingOutsideAlias.length !== missing.length) {
    if (installed.includes(alias)) {
      cli__default['default'].info(`Detected explicit import of ${alias} sub-dependency`);
    } else {
      cli__default['default'].error(
        `Detected explicit import of ${alias} sub-dependency, ${alias} missing`
      );
      return missing
    }
  }

  return missingOutsideAlias
}

/**
 * Launch the depcheck command
 * @param {object} config - loaded config
 * @returns {Promise<void>} - depcheck execution
 */
async function commandDepCheck(config) {
  if (!config) {
    cli__default['default'].info('No build config found, falling back to Depcheck CLI');

    // Remove ring-toolkit command from args
    const argv = process.argv.slice(3);

    return childProcess__default['default'].spawnSync('depcheck', argv, {
      stdio: 'inherit',
      shell: true
    })
  }

  const pkg = await fs__default['default'].readJSON(path__default['default'].resolve(process.cwd(), './package.json'));
  const results = await depcheck__default['default'](process.cwd(), config);

  const declaredDeps = [
    pkg.name,
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {})
  ];

  if (results.dependencies.length) {
    cli__default['default'].info(
      `Found ${results.dependencies.length} potentially unused ${dependencies(
        results.dependencies.length
      )}: `
    );
    results.dependencies.forEach((dep) => cli__default['default'].info(` - ${dep}`));
  }

  const missing = Object.keys(config?.alias ?? {}).reduce((m, alias) => {
    return detectAlias(m, declaredDeps, alias, config.alias[alias])
  }, Object.keys(results.missing));

  if (missing.length > 0) {
    cli__default['default'].error(
      `Found ${missing.length} missing ${dependencies(missing.length)}: `
    );
    missing.forEach((dep) => cli__default['default'].error(` - ${dep}`));
    process.exit(1);
  }

  cli__default['default'].ok('No missing dependency detected');
}

/**
 * Launch @web/dev-server
 * @param {object} config - loaded config
 * @param {object} params - received params
 * @param {boolean | string} params.cors - whether to enable cors, can be an origin matcher or a boolean
 * @param {boolean | string} params.spa - whether to enable SPA routing
 * @param {string} params.ssl-cert - path to the SSL certificate
 * @param {string} params.ssl-key -path to the SSL key
 * @returns {Promise<void>} - @web/dev-server execution
 */
async function commandServe(config, params) {
  // Remove ring-toolkit command from args
  const argv = process.argv.slice(3);

  cli__default['default'].info('Starting @web/dev-server (static serving mode)');

  const paramsConfig = {};

  if (params.publicFolder) {
    paramsConfig.rootDir = params.publicFolder;
  }

  if (params.cors) {
    paramsConfig.middleware = [
      cors__default['default']({
        origin: params.cors === true ? '*' : params.cors,
        allowMethods: 'GET'
      })
    ];
  }

  if (params.spa) {
    paramsConfig.appIndex = path__default['default'].join(
      paramsConfig.rootDir ?? '/',
      params.spa === true ? 'index.html' : params.spa
    );
  }

  if (params.sslKey || params.sslCert) {
    paramsConfig.http2 = true;
    paramsConfig.sslKey = params.sslKey;
    paramsConfig.sslCert = params.sslCert;
  }

  const server = await devServer.startDevServer(
    config
      ? {
          ...config,
          config: {
            ...config.config,
            ...paramsConfig,
            middleware: [
              ...(config.config.middleware ?? []),
              ...(paramsConfig.middleware ?? [])
            ]
          },
          argv
        }
      : {
          readFileConfig: true,
          readCliArgs: true,
          argv
        }
  );

  process.addListener('exit', () => {
    server.stop();
  });
}

// Prepare adapters

const adapters = {
  modernWeb: devServerRollup.fromRollup,
  rollup: (p) => p
};

/**
 * @typedef {Object} Pipeline
 * @property {function(...[string]): boolean} flavorIn - check if the flavor is one of the provided
 * @property {function(...[string]): void} withFlavors - throws if the flavor is not one of the provided
 * @property {function(boolean, Object,((plugin[])[] | string)[]): plugin[]} - build the pipeline
 */

/**
 * Create a Pipeline handling object
 * @param {string} flavor - flavor to use
 * @param {string} devFlavors - list of dev flavors
 * @param {string} handledFlavors - list of handled flavors
 * @returns {Pipeline} - the constructed pipeline
 * @constructor
 */
function Pipeline({
  flavor,
  handledFlavors = [],
  devFlavors = handledFlavors
}) {
  if (handledFlavors.length > 0 && !handledFlavors.includes(flavor)) {
    throw new Error(`Unknown pipeline flavor ${flavor}`)
  }

  return {
    /**
     * Check that the given flavor is one of the given flavors
     * @param {string} flavors - list of allowed flavors
     * @returns {boolean} - whether the flavor is correct
     */
    flavorIn(...flavors) {
      return !flavors || flavors.includes(flavor) || flavors.length === 0
    },

    /**
     * Combine a list of step into a pipeline, wrapping plugins in the
     * provided adapter
     * @param {object} parameters - parameters to pass down to each step
     * @param {((plugin[])[] | string)[]} steps - steps of plugins to flatten and wrap
     * @returns {plugin[]} - adapted pipeline
     */
    build(parameters, steps) {
      const adapter = this.flavorIn(...devFlavors)
        ? adapters.modernWeb
        : adapters.rollup;

      return steps
        .map((step) => {
          if (step && this.flavorIn(...step.slice(1))) {
            return step[0]
          }

          return false
        })
        .filter(Boolean)
        .flatMap((step) => {
          try {
            return step(adapter, parameters).filter(Boolean)
          } catch (err) {
            console.log(step);
            throw err
          }
        })
    }
  }
}

/**
 * Load Ring Toolkit configuration from current working directory
 * @param {string} configFile - The file to load the configuration from
 * @returns {Promise<{}|*>} - Loaded configuration
 */
async function loadConfiguration(configFile) {
  let config = {};
  try {
    if (configFile) {
      const parts = configFile.split('.');
      let found = null;
      while (!found && parts.length) {
        found = await configLoader.readConfig(parts.join('.'));
        parts.pop();
      }

      config = found ?? {};
    } else {
      config =
        (await configLoader.readConfig('rtconfig')) ??
        (await configLoader.readConfig('ring-toolkit.config')) ??
        {};
    }
  } catch (error) {
    if (error instanceof configLoader.ConfigLoaderError) {
      // If the error is a ConfigLoaderError it has a human readable error message
      // there is no need to print the stack trace.
      console.error(error.message);
      return {}
    }
    console.error(error);
    return {}
  }

  return config
}

/**
 * Extract the configuration of a given subcommand
 * @param {string[]} slots - fields to lookup for the configuration
 * @param {Object} config - the complete Ring Toolkit configuration
 * @returns {Promise<*|*>} - the subcommand configuration
 */
async function getCommandConfiguration(slots, config) {
  const commandConfig = config[slots.find((slot) => !!config[slot])];

  if (typeof commandConfig === 'function') {
    return await commandConfig()
  }

  return commandConfig
}

/**
 * Fetch the corresponding config, and run the command
 * @param {function} command - command to run
 * @param {string[]} slots - slots to fetch the config from
 * @param {object} [params] - params to pass to the command
 * @returns {Promise<void>} - command execution
 */
async function run(command, slots, params) {
  await command(
    await getCommandConfiguration(slots, await loadConfiguration(params.config)),
    params
  );
}

const app = sade__default['default']('ring-toolkit');

const pkg = fs__default['default'].readJsonSync(path__default['default'].resolve(path__default['default'].dirname(url__default['default'].fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('index.js', document.baseURI).href)))), '../package.json'));

app.version(pkg.version);

app.describe('Ring Toolkit CLI (alias: ring)');

const aliases = {
  dev: ['webDevServer', '@web/dev-server', 'web-dev-server', 'wds', 'start'],
  test: ['webTestRunner', '@web/test-runner', 'web-test-runner', 'wtr'],
  build: ['rollup', 'bundle'],
  serve: ['static'],
  depcheck: []
};

const configOption = ['-c, --config', 'Path to the configuration file to load', './rtconfig'];

app
  .command('dev')
  .alias(aliases.dev)
  .describe('launch @web/dev-server, accept any additional wds parameter')
  .option(...configOption)
  .action(async (options) => {
    await run(commandDev, ['dev', ...aliases.dev], options);
  });

app
  .command('test')
  .alias(aliases.test)
  .describe('launch @web/test-runner, accept any additional wtr parameter')
  .option(...configOption)
  .action(async (options) => {
    await run(commandTest, ['test', ...aliases.test], options);
  });

app
  .command('build')
  .alias(aliases.build)
  .describe(
    'launch rollup, accept rollup CLI parameters if config is not provided'
  )
  .option(...configOption)
  .action(async (options) => {
    await run(commandBuild, ['build', ...aliases.build], options);
  });

app
  .command('serve [public]')
  .alias(aliases.serve)
  .option(...configOption)
  .option('-C, --cors', 'Enable CORS', false)
  .option('-s, --spa', 'Enable SPA fallback to index.html', false)
  .option('--ssl-key', 'Path to SSL key. Enables SSL')
  .option('--ssl-cert', 'Path to SSL cert. Enables SSL')
  .describe(
    'launch @web/dev-server configured for static serving, accept any additional wds parameter'
  )
  .action(async (publicFolder, options) => {
    await run(commandServe, ['serve', ...aliases.serve], {
      publicFolder,
      sslKey: options['ssl-key'],
      sslCert: options['ssl-cert'],
      ...options
    });
  });

app
  .command('depcheck')
  .alias(aliases.depcheck)
  .describe('launch depcheck')
  .option(...configOption)
  .action(async (options) => {
    await run(commandDepCheck, ['depcheck', ...aliases.depcheck], options);
  });

/**
 * Execute the CLI
 * @returns {void}
 */
function cli() {
  app.parse(process.argv);
}

exports.Pipeline = Pipeline;
exports.cli = cli;
