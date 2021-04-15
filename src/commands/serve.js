import cli from 'cli'
import path from 'path'

import { startDevServer } from '@web/dev-server'
import cors from '@koa/cors'

/**
 * Launch @web/dev-server
 * @param {object} config - loaded config
 * @param {object} params - received params
 * @param {boolean | string} params.cors - whether to enable cors, can be an origin matcher or a boolean
 * @param {boolean | string} params.spa - whether to enable SPA routing
 * @param {string} params.sslCert - path to the SSL certificate
 * @param {string} params.sslKey -path to the SSL key
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

  if (params.sslKey || params.sslCert) {
    paramsConfig.http2 = true
    paramsConfig.sslKey = params.sslKey
    paramsConfig.sslCert = params.sslCert
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
