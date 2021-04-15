import sade from 'sade'
import fs from 'fs-extra'
import { readConfig, ConfigLoaderError } from '@web/config-loader'

import { commandDev } from './commands/dev.js'
import { commandTest } from './commands/test.js'
import { commandBuild } from './commands/build.js'
import { commandDepCheck } from './commands/depcheck.js'
import { commandServe } from './commands/serve.js'

/**
 * Load Ring Toolkit configuration from current working directory
 * @returns {Promise<{}|*>} - Loaded configuration
 */
async function loadConfiguration() {
  let config = {}
  try {
    config =
      (await readConfig('rtconfig')) ??
      (await readConfig('ring-toolkit.config')) ??
      {}
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
    await getCommandConfiguration(slots, await loadConfiguration()),
    params
  )
}

const app = sade('ring-toolkit')

const pkg = fs.readJsonSync('./package.json')

app.version(pkg.version)

app.describe('Ring Toolkit CLI (alias: rtk, ring)')

const aliases = {
  dev: ['webDevServer', '@web/dev-server', 'web-dev-server', 'wds', 'start'],
  test: ['webTestRunner', '@web/test-runner', 'web-test-runner', 'wtr'],
  build: ['rollup', 'bundle'],
  serve: ['static'],
  depcheck: []
}

app
  .command('dev')
  .alias(aliases.dev)
  .describe('launch @web/dev-server, accept any wds parameter')
  .action(async () => {
    await run(commandDev, ['dev', ...aliases.dev])
  })

app
  .command('test')
  .alias(aliases.test)
  .describe('launch @web/test-runner, accept any wtr parameter')
  .action(async () => {
    await run(commandTest, ['test', ...aliases.test])
  })

app
  .command('build')
  .alias(aliases.build)
  .describe(
    'launch rollup, accept rollup CLI parameters if config is not provided'
  )
  .action(async () => {
    await run(commandBuild, ['build', ...aliases.build])
  })

app
  .command('serve [public]')
  .alias(aliases.serve)
  .option('-c, --cors [cors]', 'Enable CORS', false)
  .option('-s, --spa [appIndex]', 'Enable SPA fallback to index.html', false)
  .describe(
    'launch @web/dev-server configured for static serving, accept any @web/dev-server parameter'
  )
  .action(async (publicFolder, options) => {
    await run(commandServe, ['serve', ...aliases.serve], {
      publicFolder,
      ...options
    })
  })

app
  .command('depcheck')
  .alias(aliases.depcheck)
  .describe('launch depcheck')
  .action(async () => {
    await run(commandDepCheck, ['depcheck', ...aliases.depcheck])
  })

/**
 * Execute the CLI
 * @returns {void}
 */
export function cli() {
  app.parse(process.argv)
}

export * from './pipeline/index.js'
