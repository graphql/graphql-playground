# graphql-playground-middleware-koa

> Koa middleware to expose an endpoint for the GraphQL Playground IDE
> **SECURITY NOTE**: All versions of `graphql-playground-koa` until `1.6.15` or later have a security vulnerability when unsanitized user input is used while invoking `koaPlayground()`. [Read more below](#security-notes)

## Installation

Using yarn:

```console
yarn add graphql-playground-middleware-koa
```

Or npm:

```console
npm install graphql-playground-middleware-koa --save
```

## Usage

See full example in [examples/basic](https://github.com/prisma/graphql-playground/tree/main/packages/graphql-playground-middleware-koa/examples/basic).

```js
const koa = require('koa')
const koaRouter = require('koa-router')
const koaPlayground = require('graphql-playground-middleware-koa')

const app = new koa()
const router = new koaRouter()

router.all('/playground', koaPlayground({ endpoint: '/graphql' }))
```

## Security Notes

All versions before `1.6.15` were vulnerable to user-defined input to `koaPlayground()`. Read more in [the security notes](https://github.com/prisma/graphql-playground/tree/main/SECURITY.md)

### Security Upgrade Steps

To fix the issue, you can upgrade to `1.6.15` or later. If you aren't able to upgrade, see the security notes for a workaround.

**yarn:**
`yarn add graphql-playground-koa@^1.6.15`

**npm:**
`npm install --save graphql-playground-koa@^1.6.15`
