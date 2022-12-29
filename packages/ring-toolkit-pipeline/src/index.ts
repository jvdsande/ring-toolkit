// Prepare adapters
import { fromRollup } from '@web/dev-server-rollup';

const adapters = {
  modernWeb: fromRollup,
  rollup: (p: any) => p,
};

type PipelineStep = [
  (
    adapter: typeof adapters['modernWeb' | 'rollup'],
    parameters: Record<string, any>,
  ) => ReturnType<typeof fromRollup>[],
  ...string[]
];

interface Pipeline {
  /**
   * Check if the pipeline's flavor is one of the provided flavors
   * @param flavors - provided flavors to check against
   */
  flavorIn(...flavors: string[]): boolean;

  /**
   * Build the pipeline
   * @param parameters - set of parameters to pass to each step
   * @param steps - pipeline steps to flatten and wrap in the correct plugin adapter
   */
  build(parameters: Record<string, any>, steps: PipelineStep[]): ReturnType<typeof fromRollup>[];
}

interface PipelineOptions {
  /**
   * flavor to use
   */
  flavor: string;

  /**
   * list of dev flavors
   */
  devFlavors: string[];

  /**
   * List of handled flavors
   */
  handledFlavors: string[];
}

function isStepFunction(value: PipelineStep[0] | false): value is PipelineStep[0] {
  return !!value;
}

/**
 * Create a Pipeline handling object
 * @param flavor - flavor to use
 * @param devFlavors - list of dev flavors
 * @param handledFlavors - list of handled flavors
 * @returns - the constructed pipeline
 * @constructor
 */
export function Pipeline({
  flavor,
  handledFlavors = [],
  devFlavors = handledFlavors,
}: PipelineOptions): Pipeline {
  if (handledFlavors.length > 0 && !handledFlavors.includes(flavor)) {
    throw new Error(`Unknown pipeline flavor ${flavor}`);
  }

  const pipeline: Pipeline = {
    /**
     * Check that the pipeline flavor is one of the given flavors
     * @param {string} flavors - list of allowed flavors
     * @returns {boolean} - whether the flavor is correct
     */
    flavorIn(...flavors) {
      return !flavors || flavors.includes(flavor) || flavors.length === 0;
    },

    /**
     * Combine a list of step into a pipeline, wrapping plugins in the
     * provided adapter
     * @param {object} parameters - parameters to pass down to each step
     * @param {((plugin[])[] | string)[]} steps - steps of plugins to flatten and wrap
     * @returns {plugin[]} - adapted pipeline
     */
    build(parameters, steps) {
      const adapter = pipeline.flavorIn(...devFlavors) ? adapters.modernWeb : adapters.rollup;

      return steps
        .map(step => {
          const [stepFunction, ...stepFlavors] = step ?? [];

          if (step && pipeline.flavorIn(...stepFlavors)) {
            return stepFunction;
          }

          return false;
        })
        .filter(isStepFunction)
        .flatMap(step => {
          try {
            return step(adapter, parameters).filter(Boolean);
          } catch (err) {
            console.log(step);
            throw err;
          }
        });
    },
  };

  return pipeline;
}
