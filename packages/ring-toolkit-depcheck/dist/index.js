"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ringToolkitDepcheck = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = __importDefault(require("child_process"));
const nanocolors_1 = require("nanocolors");
const depcheck_1 = __importDefault(require("depcheck"));
const executable_1 = require("@ring-toolkit/executable");
const utils_1 = require("./utils");
exports.ringToolkitDepcheck = executable_1.createExecutable({
    options: [],
    summary: 'launch depcheck',
    async command(configuration, { argv }, logger) {
        var _a;
        if (!configuration) {
            logger.log('No depcheck configuration found, falling back to Depcheck CLI');
            await child_process_1.default.spawnSync('depcheck', argv, {
                stdio: 'inherit',
                shell: true,
            });
            return;
        }
        const pkg = await fs_extra_1.default.readJSON(path_1.default.resolve(process.cwd(), './package.json'));
        const results = await depcheck_1.default(process.cwd(), configuration);
        const declaredDeps = [
            pkg.name,
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.peerDependencies || {}),
            ...Object.keys(pkg.devDependencies || {}),
        ];
        if (results.dependencies.length) {
            logger.log(`Found ${nanocolors_1.bold(results.dependencies.length)} potentially unused ${utils_1.dependencies(results.dependencies.length)}: `);
            results.dependencies.sort().forEach(dep => logger.log(` - ${dep}`));
        }
        const missing = Object.keys((_a = configuration === null || configuration === void 0 ? void 0 : configuration.alias) !== null && _a !== void 0 ? _a : {}).reduce((m, alias) => {
            const result = utils_1.detectAlias(m, declaredDeps, alias, configuration.alias[alias]);
            if (result.detected) {
                const color = result.installed ? nanocolors_1.yellow : nanocolors_1.red;
                const log = result.installed ? logger.log : logger.error;
                log('Detected explicit import of ' + color(alias) + ' sub-dependency.');
                if (!result.installed) {
                    log(color(alias) + ' missing.');
                }
            }
            return result.missing;
        }, Object.keys(results.missing));
        if (missing.length > 0) {
            logger.error(`Found ${missing.length} missing ${utils_1.dependencies(missing.length)}: `);
            missing.sort().forEach(dep => logger.error(` - ${dep}`));
            process.exit(1);
        }
        logger.log(nanocolors_1.green('No missing dependency detected'));
    },
});
//# sourceMappingURL=index.js.map