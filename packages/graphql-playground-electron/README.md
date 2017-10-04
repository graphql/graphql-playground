# Playground

Repository for the electron playground app.

## Development
```sh
yarn install
yarn start
```

## Production build

```sh
yarn release
```

This will create a `build-electron` folder where you will have the compiled electron app. (The assets will automatically be uploaded to Github if the `GH_TOKEN` env variable is set. See [here](https://www.electron.build/publishing-artifacts) for more.)
