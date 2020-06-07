# graphql-playground-middleware-lambda

> Koa middleware to expose an endpoint for the GraphQL Playground IDE
> **SECURITY NOTE**: All versions of `graphql-playground-middleware-lambda` until `1.7.17` or later have a security vulnerability when unsanitized user input is used while invoking `lambdaPlayground()`. [Read more below](#security-notes)

## Installation

Using yarn:

```console
yarn add graphql-playground-middleware-lambda
```

Or npm:

```console
npm install graphql-playground-middleware-lambda --save
```

## Usage

See full example in [examples/basic](https://github.com/prisma/graphql-playground/tree/master/packages/graphql-playground-middleware-lambda/examples/basic).

minimal example:

```js
const lambdaPlayground = require('graphql-playground-middleware-lambda').default

exports.handler = lambdaPlayground({
  endpoint: '/dev',
})
```

## Security Notes

All versions before `1.7.17` were vulnerable to user-defined input to `lambdaPlayground()`. Read more in [the security notes](https://github.com/prisma/graphql-playground/tree/SECURITY.md)

### Security Upgrade Steps

To fix the issue, you can upgrade to `1.7.17`. If you aren't able to upgrade, see the security notes for a workaround.

**yarn:**
`yarn add graphql-playground-middleware-lambda@^1.7.17`

**npm:**
`npm install --save graphql-playground-middleware-lambda@^1.7.17`
