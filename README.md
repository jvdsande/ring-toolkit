# Ring Toolkit

> _One Ring to **dev** them all_ <br /> _One Ring to **test** them_ <br /> _One Ring to **build** them all_ <br /> _And in the browser **serve** them_

Ring Toolkit is an aggregator of Web Build tools, shared in a simple CLI wrapper for ease of use.

The tools selected and wrapped into Ring Toolkit allow all the steps of web-app development:

- A development server and static server capabilities are provided through [**@web/dev-server**](https://modern-web.dev/docs/dev-server/overview/)
- A test environment is provided through [**@web/test-runner**](https://modern-web.dev/docs/test-runner/overview/)
- A build pipeline is provided through [**rollup**](https://rollupjs.org/guide/)
- A dependency validator is provided through [**depcheck**](https://www.npmjs.com/package/depcheck/)

## Installation & Usage

You can install Ring Toolkit by running the following command:

```
npm i -D ring-toolkit
// Or if you are using yarn: yarn add -D ring-toolkit
```

This will install the Ring Toolkit CLI as well as all the wrapped tools.

You can then use Ring Toolkit for all the steps of your project:

```
// Launch a dev server with @web/dev-server
npx ring-toolkit dev
```

```
// Launch a test framework with @web/test-runner
npx ring-toolkit test
```

```
// Build your app with rollup
npx ring-toolkit build
```

```
// Serve your built app with @web/dev-server
npx ring-toolkit serve
```

```
// Check your dependencies with depcheck
npx ring-toolkit depcheck
```

You can also use the `ring` shorthand binary:

```
npx ring build
// same as npx ring-toolkit build
```

Each command can work as an alias for the underlying product, meaning that any CLI flag available for the product can be passed to the command:

```
// Launch rollup with a given configuration
npx ring-toolkit build -c my-rollup.config.js
```

## Centralized configuration

Ring Toolkit uses a centralized configuration for your project.
In order to keep this configuration modular, it uses a JavaScript config file, with the `.mjs` extension.

This file can either be `ring-toolkit.config.mjs` if you'd rather have a full name, or `rtconfig.mjs` for a shorter name.

The configuration should implement the following interface:

```ts
interface RingToolkitConfiguration {
  // Can use alias `@web/dev-server`,  'web-dev-server', 'wds'
  dev?: WebDevServerConfiguration | (() => Promise<WebDevServerConfiguration>);
  test?: WebTestRunnerConfiguration | (() => Promise<WebTestRunnerConfiguration>);
  build?: RollupConfiguration | (() => Promise<RollupConfiguration>);
  serve?: WebDevServerConfiguration | (() => Promise<WebDevServerConfiguration>);
  depcheck?: DepCheckConfiguration | (() => Promise<DepCheckConfiguration>);
}
```

The configuration types are the following:

- `WebDevServerConfiguration`: [Modern Web Documentation](https://modern-web.dev/docs/dev-server/cli-and-configuration/)
- `WebTestRunnerConfiguration`: [Modern Web Documentation](https://modern-web.dev/docs/test-runner/cli-and-configuration/)
- `RollupConfiguration`: [Rollup Documentation](https://rollupjs.org/guide/en/#big-list-of-options)
- `DepCheckConfiguration`: [Depcheck Readme](https://www.npmjs.com/package/depcheck#api)

All fields are optional. If configuration for a tool is not given, Ring Toolkit will let the tool look for its configuration as if it was run in a standalone fashion.

Each field can either be a configuration object for the underlying tool (as would be provided in this tool's configuration file), or a function returning a Promise to the configuration object.

The Ring Toolkit configuration file should export this configuration as default:

```js
export default {
  dev: {
    port: 3000,
    watch: true,
  },
};
```

Thanks to this setup, it is possible to maintain a shared standardized configuration and use it across project to configure, in one line of code, the four underlying tools:

```js
import { configShared } from '@ring-toolkit/config-shared';

export default configShared();
// Here we can pass any custom options for our shared configuration
```
