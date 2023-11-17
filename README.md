# cypress-rspack-dev-server

Based off the amazing work of the cypress team at https://github.com/cypress-io/cypress/blob/develop/npm/webpack-dev-server/

Implements the APIs for the object-syntax of the Cypress Component-testing "rspack dev server".

Object API:

```ts
import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'rspack',
      // rspackConfig?: Will try to infer, if passed it will be used as is
    }
  }
})
```

Function API:

```ts
import { devServer } from 'cypress-rspack-dev-server'
import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: 'react',
        rspackConfig: require('./rspack.config.js')
      })
    }
  }
})
```

## Architecture

There should be a single publicly-exported entrypoint for the module, `devServer`, all other types and functions should be considered internal/implementation details, and types stripped from the output.

The `devServer` will first source the modules from the user's project, falling back to our own bundled versions of
libraries. This ensures that the user has installed the current modules, and throws an error if the user does not have
the library installed.

From there, we check the "framework" field to source or define any known rspack transforms to aid in the compilation.

We then merge the sourced config with the user's rspack config, and layer on our own transforms, and provide this to a
rspack instance. The rspack instance used to create a rspack-dev-server, which is returned.

## Compatibility

| cypress-rspack-dev-server | cypress |
| ------------------------- | ------- |
| >= 0.3                    | >= v12  |

## License

[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/cypress-io/cypress/blob/develop/LICENSE)

This project is licensed under the terms of the [MIT license](/LICENSE).

