import { createExecutable } from '@ring-toolkit/executable';
import childProcess from 'child_process';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
import { bold, gray, green, red, underline, yellow } from 'nanocolors';

export const ringToolkitRollup = createExecutable({
  options: [],
  summary: 'launch rollup, accept rollup CLI parameters if config is not provided',
  async command(configuration: RollupOptions, { argv }, logger) {
    if (!configuration) {
      logger.log('No build config found, falling back to Rollup CLI');

      await childProcess.spawnSync('rollup', argv, {
        stdio: 'inherit',
        shell: true,
      });

      return;
    }

    logger.log('Building using Rollup...');

    async function executeRollup(rollupConfig: RollupOptions) {
      const bundle = await rollup({
        ...rollupConfig,
        onwarn: warning => {
          if (warning.plugin) {
            logger.log(`${bold(yellow(warning.plugin))}:`);
          }
          logger.log(warning.message);
          if (warning.id) {
            logger.log(`In file ${underline(gray(warning.id))}`);
          }
        },
      });

      if (rollupConfig.output) {
        await bundle.write(rollupConfig.output as OutputOptions);
      }

      await bundle.close();
    }

    try {
      if (Array.isArray(configuration)) {
        for (const conf of configuration) {
          await executeRollup(conf);
        }
      } else {
        await executeRollup(configuration);
      }
    } catch (err) {
      logger.error(red('An error occurred during build'));
      logger.error(err);

      process.exit(1);
    }

    logger.log(green('Build successful!'));
  },
});
