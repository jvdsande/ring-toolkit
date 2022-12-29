import { fromRollup } from '@web/dev-server-rollup';
declare const adapters: {
    modernWeb: typeof fromRollup;
    rollup: (p: any) => any;
};
declare type PipelineStep = [
    (adapter: typeof adapters['modernWeb' | 'rollup'], parameters: Record<string, any>) => ReturnType<typeof fromRollup>[],
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
/**
 * Create a Pipeline handling object
 * @param flavor - flavor to use
 * @param devFlavors - list of dev flavors
 * @param handledFlavors - list of handled flavors
 * @returns - the constructed pipeline
 * @constructor
 */
export declare function Pipeline({ flavor, handledFlavors, devFlavors, }: PipelineOptions): Pipeline;
export {};
//# sourceMappingURL=index.d.ts.map