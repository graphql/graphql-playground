# graphql-playground-middleware-koa
> Koa middleware to expose an endpoint for the GraphQL Playground IDE

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

See full example in [examples/basic](https://github.com/prisma/graphql-playground/tree/master/packages/graphql-playground-middleware-koa/examples/basic).

```js
const koa = require('koa')
const koaRouter = require('koa-router')
const koaPlayground = require('graphql-playground-middleware-koa')

const app = new koa()
const router = new koaRouter()

router.all('/playground', koaPlayground({ endpoint: '/graphql' }))
```
