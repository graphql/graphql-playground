# graphql-playground-middleware-hapi

> Koa middleware to expose an endpoint for the GraphQL Playground IDE
> **SECURITY NOTE**: All versions of `graphql-playground-middleware-hapi` until `1.6.13` or later have a security vulnerability when unsanitized user input is used while invoking `hapiPlayground()`. [Read more below](#security-notes)

## Installation

Using yarn:

```console
yarn add graphql-playground-middleware-hapi
```

Or npm:

```console
npm install graphql-playground-middleware-hapi --save
```

## Usage

See full example in [examples/basic](https://github.com/prisma/graphql-playground/tree/master/packages/graphql-playground-middleware-hapi/examples/basic).

minimal example:

```js
const hapiPlayground = require('graphql-playground-middleware-hapi').default

const playground = {
  plugin: hapiPlayground,
  options: {
    path: '/playground',
    endpoint: '/graphql',
  },
}

const app = new Hapi.server({
  port: 3000,
})

app.register(playground)
;(async () => await app.start())()
```

## Security Notes

All versions before `1.6.13` were vulnerable to user-defined input to `hapiPlayground()`. Read more in [the security notes](https://github.com/prisma/graphql-playground/tree/master/SECURITY.md)

### Security Upgrade Steps

To fix the issue, you can upgrade to `1.6.13` or later. If you aren't able to upgrade, see the security notes for a workaround.

**yarn:**
`yarn add graphql-playground-middleware-hapi@^1.6.13`

**npm:**
`npm install --save graphql-playground-middleware-hapi@^1.6.13`
