import url from 'url'
import fs from 'fs-extra'
import path from 'path'
import sade from 'sade'
import { readConfig, ConfigLoaderError } from '@web/config-loader'

import { commandDev } from './commands/dev.js'
import { commandTest } from './commands/test.js'
import { commandBuild } from './commands/build.js'
import { commandDepCheck } from './commands/depcheck.js'
import { commandServe } from './commands/serve.js'

/**
 * Load Ring Toolkit configuration from current working directory
 * @param {string} configFile - The file to load the configuration from
 * @returns {Promise<{}|*>} - Loaded configuration
 */
async function loadConfiguration(configFile) {
  let config = {}
  try {
    if (configFile) {
      const parts = configFile.split('.')
      let found = null
      while (!found && parts.length) {
        found = await readConfig(parts.join('.'))
        parts.pop()
      }

      config = found ?? {}
    } else {
      config =
        (await readConfig('rtconfig')) ??
        (await readConfig('ring-toolkit.config')) ??
        {}
    }
  } catch (error) {
    if (error instanceof ConfigLoaderError) {
      // If the error is a ConfigLoaderError it has a human readable error message
      // there is no need to print the stack trace.
      console.error(error.message)
      return {}
    }
    console.error(error)
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
  const commandConfig = config[slots.find((slot) => !!config[slot])]

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
  )
}

const app = sade('ring-toolkit')

const pkg = fs.readJsonSync(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../package.json'))

app.version(pkg.version)

app.describe('Ring Toolkit CLI (alias: ring)')

const aliases = {
  dev: ['webDevServer', '@web/dev-server', 'web-dev-server', 'wds', 'start'],
  test: ['webTestRunner', '@web/test-runner', 'web-test-runner', 'wtr'],
  build: ['rollup', 'bundle'],
  serve: ['static'],
  depcheck: []
}

const configOption = ['-c, --config', 'Path to the configuration file to load', './rtconfig']

app
  .command('dev')
  .alias(aliases.dev)
  .describe('launch @web/dev-server, accept any additional wds parameter')
  .option(...configOption)
  .action(async (options) => {
    await run(commandDev, ['dev', ...aliases.dev], options)
  })

app
  .command('test')
  .alias(aliases.test)
  .describe('launch @web/test-runner, accept any additional wtr parameter')
  .option(...configOption)
  .action(async (options) => {
    await run(commandTest, ['test', ...aliases.test], options)
  })

app
  .command('build')
  .alias(aliases.build)
  .describe(
    'launch rollup, accept rollup CLI parameters if config is not provided'
  )
  .option(...configOption)
  .action(async (options) => {
    await run(commandBuild, ['build', ...aliases.build], options)
  })

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
    })
  })

app
  .command('depcheck')
  .alias(aliases.depcheck)
  .describe('launch depcheck')
  .option(...configOption)
  .action(async (options) => {
    await run(commandDepCheck, ['depcheck', ...aliases.depcheck], options)
  })

/**
 * Execute the CLI
 * @returns {void}
 */
export function cli() {
  app.parse(process.argv)
}

export * from './pipeline/index.js'
