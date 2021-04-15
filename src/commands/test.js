import cli from 'cli'

import { startTestRunner } from '@web/test-runner'

/**
 * Launch @web/test-runner
 * @param {object} config - loaded config
 * @returns {Promise<void>} - @web/test-runner execution
 */
export async function commandTest(config) {
  // Remove ring-toolkit command from args
  const argv = process.argv.slice(3)

  cli.info('Starting @web/test-runner')

  const server = await startTestRunner(
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
