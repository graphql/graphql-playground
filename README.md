<p align="center"><img src="https://imgur.com/5fzMbyV.png" width="269"></p>

GraphQL IDE for better development workflows (GraphQL Subscriptions, interactive docs & collaboration). <br />
**You can download the [desktop app](https://github.com/graphcool/graphql-playground/releases) or use the web version at graphqlbin.com: [Demo](https://www.graphqlbin.com/RVIn)**

[![](https://imgur.com/6IC6Huj.png)](https://www.graphqlbin.com/RVIn)

## Features

* ✨ Context-aware autocompletion & error highlighting
* 📚 Interactive, multi-column docs (keyboard support)
* ⚡️ Supports real-time GraphQL Subscriptions

## FAQ

### How is this different from [GraphiQL](https://github.com/graphql/graphiql)?

GraphQL Playground uses components of GraphiQL under the hood but is meant as a more powerful GraphQL IDE enabling better (local) development workflows. Compared to GraphiQL, the GraphQL Playground ships with the following additional features:

* Interactive, multi-column schema documentation
* Automatic schema reloading
* Support for GraphQL Subscriptions
* Query history
* Configuration of HTTP headers
* Tabs

See the following question for more additonal features.

### What's the difference between the desktop app and the web version?

The desktop app is the same as the web version but includes these additional features:

* Support for [graphql-config](https://github.com/graphcool/graphql-config) enabling features like multi-environment setups.
* Double click on `*.graphql` files.

### How does GraphQL Bin work?

You can easily share your Playgrounds with others by clicking on the "Share" button and sharing the generated link. You can think about GraphQL Bin like Pastebin for your GraphQL queries including the context (endpoint, HTTP headers, open tabs etc).

![](https://imgur.com/H1n64lL.png)

> You can also find the announcement blog post [here](https://blog.graph.cool/introducing-graphql-playground-f1e0a018f05d).


## Usage

### Properties
All interfaces, the React component `<Playground />` and all middlewares expose the same set of options:

+ `properties`
  + `endpoint` [`string`] - the GraphQL endpoint url.
  + `subscriptionEndpoint` [`string`] - the GraphQL subscriptions endpoint url.
  + `setTitle` [`boolean`] - reflect the current endpoint in the page title

### As React Component

#### Install
```sh
yarn add graphql-playground
```
  
#### Use
GraphQL Playground provides a React component responsible for rendering the UI and Session management.
There are **3 dependencies** needed in order to run the `graphql-playground` React component.
1. _Open Sans_ and _Source Code Pro_ fonts
2. Including `graphql-playground/playground.css`
3. Rendering the `<Playground />` component

The GraphQL Playground requires **React 16**.

Including Fonts (`1.`)
```html
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Source+Code+Pro:400,700" rel="stylesheet">
```

Including stylesheet and the component (`2., 3.`)
```js
import React from 'react'
import ReactDOM from 'react-dom'
import Playground from 'graphql-playground'
import 'graphql-playground/playground.css'

ReactDOM.render(<Playground endpoint="https://api.graph.cool/simple/v1/swapi" />, document.body)
```

### As Express Middleware

#### Install
```sh
yarn add graphql-playground-middleware
```

#### Usage
```js
const express = require('express')
const bodyParser = require('body-parser')
const {graphqlExpress} = require('apollo-server-express')
const {makeExecutableSchema} = require('graphql-tools')
const {expressPlayground} = require('graphql-playground-middleware')

const schema = makeExecutableSchema({
  typeDefs: `
    type Query {
      hello: String!
    }
    schema {
      query: Query
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    },
  },
})
const PORT = 4000

const app = express()

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
app.get('/playground', expressPlayground({ endpoint: '/graphql' })) // if you want GraphiQL enabled

app.listen(PORT)

console.log(`Serving the GraphQL Playground on http://localhost:${PORT}/playground`)
```

See [packages/graphql-playground-middleware/examples/express](https://github.com/graphcool/graphql-playground/tree/master/packages/graphql-playground-middleware/examples/express) for a full example.

### As Hapi Middleware

#### Install
```sh
yarn add graphql-playground-middleware
```

#### Usage
```js
const hapi = require('hapi')
const {graphqlHapi} = require('apollo-server-hapi')
const {hapiPlayground} = require('graphql-playground-middleware')
const {makeExecutableSchema} = require('graphql-tools')

const server = new hapi.Server({ debug: { request: "*" } });

const HOST = 'localhost';
const PORT = 4000;

const schema = makeExecutableSchema({
  typeDefs: `
    type Query {
      hello: String!
    }
    schema {
      query: Query
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    },
  },
})

server.connection({
  host: HOST,
  port: PORT,
});

server.register({
  register: graphqlHapi,
  options: {
    path: '/graphql',
    graphqlOptions: {
      schema,
    },
    route: {
      cors: true
    }
  },
});

server.register({
  register: hapiPlayground,
  options: {
    path: '/playground',
    endpoint: '/graphql'
  }
})

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});
```

See [packages/graphql-playground-middleware/examples/hapi](https://github.com/graphcool/graphql-playground/tree/master/packages/graphql-playground-middleware/examples/hapi) for a full example.

### As Koa Middleware

#### Install
```sh
yarn add graphql-playground-middleware
```

#### Usage
```js
const koa = require('koa')
const koaRouter = require('koa-router')
const koaBody = require('koa-bodyparser')
const { graphqlKoa } = require('apollo-server-koa')
const {makeExecutableSchema} = require('graphql-tools')
const {koaPlayground} = require('graphql-playground-middleware')

const schema = makeExecutableSchema({
  typeDefs: `
    type Query {
      hello: String!
    }
    schema {
      query: Query
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    },
  },
})

const app = new koa();
const router = new koaRouter();
const PORT = 4000;

// koaBody is needed just for POST.
app.use(koaBody());

router.post('/graphql', graphqlKoa({ schema }));

router.all('/playground', koaPlayground({
  endpoint: '/graphql'
}))

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);

console.log(`Serving the GraphQL Playground on http://localhost:${PORT}/playground`)
```

See [packages/graphql-playground-middleware/examples/koa](https://github.com/graphcool/graphql-playground/tree/master/packages/graphql-playground-middleware/examples/koa) for a full example.

### As serverless handler
#### Install
```sh
yarn add graphql-playground-middleware
```

#### Usage
`handler.js`

```js
exports.graphqlHandler = function graphqlHandler(event, context, callback) {
  function callbackFilter(error, output) {
    // eslint-disable-next-line no-param-reassign
    output.headers['Access-Control-Allow-Origin'] = '*';
    callback(error, output);
  }

  const handler = graphqlLambda({ schema: myGraphQLSchema });
  return handler(event, context, callbackFilter);
};

exports.playgroundHandler = lambdaPlayground({
  endpoint: '/dev/graphql',
});
```

`serverless.yml`

```yaml
functions:
  graphql:
    handler: handler.graphqlHandler
    events:
    - http:
        path: graphql
        method: post
        cors: true
  playground:
    handler: handler.playgroundHandler
    events:
    - http:
        path: playground
        method: get
        cors: true
```

See [serverless-graphql-apollo](https://github.com/serverless/serverless-graphql-apollo) for a full example.

## Development [![npm version](https://badge.fury.io/js/graphql-playground.svg)](https://badge.fury.io/js/graphql-playground)

This is a mono-repo setup containing packages for the `graphql-playground` and `graphql-playground-electron`.

```sh
$ cd packages/graphql-playground
$ yarn
$ yarn start
```
Open
[localhost:3000/middleware.html?endpoint=https://api.graph.cool/simple/v1/swapi](http://localhost:3000/middleware.html?endpoint=https://api.graph.cool/simple/v1/swapi) for local development!


<a name="help-and-community" />

## Help & Community [![Slack Status](https://slack.graph.cool/badge.svg)](https://slack.graph.cool)

Join our [Slack community](http://slack.graph.cool/) if you run into issues or have questions. We love talking to you!

[![](http://i.imgur.com/5RHR6Ku.png)](https://www.graph.cool/)
