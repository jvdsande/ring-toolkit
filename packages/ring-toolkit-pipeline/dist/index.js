"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = void 0;
// Prepare adapters
const dev_server_rollup_1 = require("@web/dev-server-rollup");
const adapters = {
    modernWeb: dev_server_rollup_1.fromRollup,
    rollup: (p) => p,
};
function isStepFunction(value) {
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
function Pipeline({ flavor, handledFlavors = [], devFlavors = handledFlavors, }) {
    if (handledFlavors.length > 0 && !handledFlavors.includes(flavor)) {
        throw new Error(`Unknown pipeline flavor ${flavor}`);
    }
    const pipeline = {
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
                const [stepFunction, ...stepFlavors] = step !== null && step !== void 0 ? step : [];
                if (step && pipeline.flavorIn(...stepFlavors)) {
                    return stepFunction;
                }
                return false;
            })
                .filter(isStepFunction)
                .flatMap(step => {
                try {
                    return step(adapter, parameters).filter(Boolean);
                }
                catch (err) {
                    console.log(step);
                    throw err;
                }
            });
        },
    };
    return pipeline;
}
exports.Pipeline = Pipeline;
//# sourceMappingURL=index.js.map