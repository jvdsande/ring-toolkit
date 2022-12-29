import depcheck from 'depcheck';
interface DepcheckOptions extends depcheck.Options {
    alias: {
        [alias: string]: string | RegExp | (string | RegExp)[];
    };
}
export declare const ringToolkitDepcheck: import("@ring-toolkit/executable").Executable<DepcheckOptions | undefined, any>;
export {};
//# sourceMappingURL=index.d.ts.map