# cypress-rspack-dev-server

![Changelog CI Status](https://github.com/th3fallen/cypress-rspack-dev-server/workflows/Changelog%20CI/badge.svg)

Based off the amazing work of the cypress team at https://github.com/cypress-io/cypress/blob/develop/npm/webpack-dev-server/

Implements the APIs for Cypress Component-testing with Rust-based web bundler [Rspack](https://www.rspack.dev/)'s dev server.

## Installation

Install the library to your devDependencies

```bash
npm install -D cypress-rspack-dev-server
```

## Usage

```ts
import { devServer } from "cypress-rspack-dev-server";
import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: "react",
        rspackConfig: require("./rspack.config.js"),
      });
    },
  },
});
```

## Dev server parameters

| Option                      | NOTES                                                                                                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| framework                   | `react`, currently only `react`, will support other frameworks                                                                                                                                            |
| cypressConfig               | [Cypress Plugin Configuration](https://github.com/cypress-io/cypress/blob/6766a146dbcad98da2777d4005bc182c9d0475b8/cli/types/cypress.d.ts#L3539)                                                          |
| specs                       | Array of [Cypress Spec](https://github.com/cypress-io/cypress/blob/6766a146dbcad98da2777d4005bc182c9d0475b8/cli/types/cypress.d.ts#L292C19-L292C19)                                                       |
| devServerEvents             | [Nodejs EventEmitter](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter)                                                                                                             |
| rspackConfig (Optional)     | [Rspack Configuration](https://github.com/web-infra-dev/rspack/blob/12dbc8659f9e9bd16b4bba7ee6135e63364f3975/packages/rspack/src/config/zod.ts#L1180C3-L1180C3), can be `require` from rspack config file |
| onConfigNotFound (Optional) | The callback function when config not found                                                                                                                                                               |

## Rsbuild Support

```
import config from './rsbuild.config.ts';

async devServer(devServerConfig) {
  const rsbuild = await createRsbuild({ rsbuildConfig: config });
  const rsbuildConfigs = await rsbuild.initConfigs();

  const rspackConfig = rsbuildConfigs[0];

  rspackConfig?.module?.rules?.push({
    test: /\.(ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        plugins: ['istanbul'],
      },
    },
    enforce: 'post',
  });
  return devServer({
    ...devServerConfig,
    framework: 'react',
    rspackConfig: rspackConfig,
  });
}
```

## Migration to v1

In version 1, we supports the [Cypress 14 's justInTimeCompile](https://docs.cypress.io/app/references/changelog#14-0-0), the specs structure has been updated.
If you still use Cypress <= 13, please use the version 0.0.x.

## License

[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/cypress-io/cypress/blob/develop/LICENSE)

This project is licensed under the terms of the [MIT license](/LICENSE).

````
