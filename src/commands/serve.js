import cli from 'cli'
import path from 'path'

import { startDevServer } from '@web/dev-server'
import cors from '@koa/cors'

/**
 * Launch @web/dev-server
 * @param {object} config - loaded config
 * @param {object} params - received params
 * @returns {Promise<void>} - @web/dev-server execution
 */
export async function commandServe(config, params) {
  // Remove ring-toolkit command from args
  const argv = process.argv.slice(3)

  cli.info('Starting @web/dev-server (static serving mode)')

  const paramsConfig = {}

  if (params.publicFolder) {
    paramsConfig.rootDir = params.publicFolder
  }

  if (params.cors) {
    paramsConfig.middleware = [
      cors({
        origin: params.cors === true ? '*' : params.cors,
        allowMethods: 'GET'
      })
    ]
  }

  if (params.spa) {
    paramsConfig.appIndex = path.join(
      paramsConfig.rootDir ?? '/',
      params.spa === true ? 'index.html' : params.spa
    )
  }

  const server = await startDevServer(
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
  )

  process.addListener('exit', () => {
    server.stop()
  })
}
