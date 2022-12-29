import path from 'path';
import fs from 'fs-extra';
import childProcess from 'child_process';
import { bold, green, red, yellow } from 'nanocolors';
import depcheck from 'depcheck';

import { createExecutable } from '@ring-toolkit/executable';

import { dependencies, detectAlias } from './utils';

interface DepcheckOptions extends depcheck.Options {
  alias: {
    [alias: string]: string | RegExp | (string | RegExp)[];
  };
}

export const ringToolkitDepcheck = createExecutable({
  options: [],
  summary: 'launch depcheck',
  async command(configuration: DepcheckOptions | undefined, { argv }, logger) {
    if (!configuration) {
      logger.log('No depcheck configuration found, falling back to Depcheck CLI');

      await childProcess.spawnSync('depcheck', argv, {
        stdio: 'inherit',
        shell: true,
      });
      return;
    }

    const pkg = await fs.readJSON(path.resolve(process.cwd(), './package.json'));
    const results = await depcheck(process.cwd(), configuration);

    const declaredDeps = [
      pkg.name,
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ];

    if (results.dependencies.length) {
      logger.log(
        `Found ${bold(results.dependencies.length)} potentially unused ${dependencies(
          results.dependencies.length,
        )}: `,
      );
      results.dependencies.sort().forEach(dep => logger.log(` - ${dep}`));
    }

    const missing = Object.keys(configuration?.alias ?? {}).reduce((m, alias) => {
      const result = detectAlias(m, declaredDeps, alias, configuration.alias[alias]);

      if (result.detected) {
        const color = result.installed ? yellow : red;
        const log = result.installed ? logger.log : logger.error;
        log('Detected explicit import of ' + color(alias) + ' sub-dependency.');

        if (!result.installed) {
          log(color(alias) + ' missing.');
        }
      }

      return result.missing;
    }, Object.keys(results.missing));

    if (missing.length > 0) {
      logger.error(`Found ${missing.length} missing ${dependencies(missing.length)}: `);
      missing.sort().forEach(dep => logger.error(` - ${dep}`));
      process.exit(1);
    }

    logger.log(green('No missing dependency detected'));
  },
});
