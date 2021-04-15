import cli from 'cli'

import { startDevServer } from '@web/dev-server'

/**
 * Launch @web/dev-server
 * @param {object} config - loaded config
 * @returns {Promise<void>} - @web/dev-server execution
 */
export async function commandDev(config) {
  // Remove ring-toolkit command from args
  const argv = process.argv.slice(3)

  cli.info('Starting @web/dev-server')

  const server = await startDevServer(
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
  )

  process.addListener('exit', () => {
    server.stop()
  })
}
