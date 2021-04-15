// Prepare adapters
import { fromRollup } from '@web/dev-server-rollup'

const adapters = {
  modernWeb: fromRollup,
  rollup: (p) => p
}

/**
 * @typedef {Object} Pipeline
 * @property {function(...[string]): boolean} flavorIn - check if the flavor is one of the provided
 * @property {function(...[string]): void} withFlavors - throws if the flavor is not one of the provided
 * @property {function(boolean, Object,((plugin[])[] | string)[]): plugin[]} - build the pipeline
 */

/**
 * Create a Pipeline handling object
 * @param {string} flavor - flavor to use
 * @param {string} devFlavors - list of dev flavors
 * @param {string} handledFlavors - list of handled flavors
 * @returns {Pipeline} - the constructed pipeline
 * @constructor
 */
export function Pipeline({
  flavor,
  handledFlavors = [],
  devFlavors = handledFlavors
}) {
  if (handledFlavors.length > 0 && !handledFlavors.includes(flavor)) {
    throw new Error(`Unknown pipeline flavor ${flavor}`)
  }

  return {
    /**
     * Check that the given flavor is one of the given flavors
     * @param {string} flavors - list of allowed flavors
     * @returns {boolean} - whether the flavor is correct
     */
    flavorIn(...flavors) {
      return !flavors || flavors.includes(flavor) || flavors.length === 0
    },

    /**
     * Combine a list of step into a pipeline, wrapping plugins in the
     * provided adapter
     * @param {object} parameters - parameters to pass down to each step
     * @param {((plugin[])[] | string)[]} steps - steps of plugins to flatten and wrap
     * @returns {plugin[]} - adapted pipeline
     */
    build(parameters, steps) {
      const adapter = this.flavorIn(...devFlavors)
        ? adapters.modernWeb
        : adapters.rollup

      return steps
        .map((step) => {
          if (step && this.flavorIn(...step.slice(1))) {
            return step[0]
          }

          return false
        })
        .filter(Boolean)
        .flatMap((step) => {
          try {
            return step(adapter, parameters).filter(Boolean)
          } catch (err) {
            console.log(step)
            throw err
          }
        })
    }
  }
}
