import cli from 'cli'
import childProcess from 'child_process'

import { rollup } from 'rollup'

/**
 * Create the Rollup configuration from config files, then run the Rollup build
 * @param {object} config - loaded config
 * @returns {Promise<SpawnSyncReturns<Buffer>>} - Rollup build execution
 */
export async function commandBuild(config) {
  if (!config) {
    cli.info('No build config found, falling back to Rollup CLI')

    // Remove ring-toolkit command from args
    const argv = process.argv.slice(3)

    return childProcess.spawnSync('rollup', argv, {
      stdio: 'inherit',
      shell: true
    })
  }

  cli.info('Building using Rollup...')

  async function executeRollup(rollupConfig) {
    const bundle = await rollup({
      ...rollupConfig,
      onwarn: (warning) => {
        if (warning.plugin) {
          cli.info(`${warning.plugin}:`)
        }
        cli.info(warning.message)
        if (warning.id) {
          cli.info(`In file ${warning.id}`)
        }
      }
    })

    await bundle.write(rollupConfig.output)

    await bundle.close()
  }

  try {
    if (Array.isArray(config)) {
      for (const conf of config) {
        await executeRollup(conf)
      }
    } else {
      await executeRollup(config)
    }
  } catch (err) {
    cli.error('An error occurred during build')
    cli.fatal(err)
  }

  cli.ok('Build successful!')
}
