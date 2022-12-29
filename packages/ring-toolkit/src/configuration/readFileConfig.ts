import { ConfigLoaderError, readConfig } from '@web/config-loader';

import { getLogger } from '../logger/getLogger';

/**
 * Load Ring Toolkit configuration from current working directory
 */
export async function readFileConfig(
  configFile: string | undefined,
  baseDir?: string,
): Promise<{ [key: string]: any }> {
  let config = {};
  try {
    if (configFile) {
      const parts = configFile.split('.');
      let found = null;
      while (!found && parts.length) {
        found = await readConfig(parts.join('.'), baseDir);
        parts.pop();
      }

      config = found ?? {};
    } else {
      config =
        (await readConfig('rtconfig', baseDir)) ??
        (await readConfig('ring-toolkit.config', baseDir)) ??
        {};
    }
  } catch (error) {
    const logger = getLogger();

    if (error instanceof ConfigLoaderError) {
      // If the error is a ConfigLoaderError it has a human-readable error message
      // there is no need to print the stack trace.
      logger.error(error.message);
      return {};
    }

    logger.error(error);
    return {};
  }

  return config;
}
