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

[examples/latest.html](https://github.com/graphcool/graphql-playground/blob/master/packages/graphql-playground/examples/latest.html) contains a simple example on how to use the latest playground in your application.

You also can use the latest playground based on the npm package.
In order to do that, first you need to install `graphql-playground` via NPM. Then choose one of the following options to use the Playground in your own app/server.

```
yarn add graphql-playground
```

### As React Component

#### Usage

GraphQL Playground provides a React component responsible for rendering the UI and Session management.
There are **3 dependencies** needed in order to run the `graphql-playground` React component.
1. _Open Sans_ and _Source Code Pro_ fonts
2. Including `graphql-playground/playground.css`
3. Rendering the `<Playground />` component

The GraphQL Playground requires **React 16**.

Including Fonts (1.)
```html
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Source+Code+Pro:400,700" rel="stylesheet">
```

Including stylesheet and the component (2., 3.)
```js
import React from 'react'
import ReactDOM from 'react-dom'
import Playground from 'graphql-playground'
import 'graphql-playground/playground.css'

ReactDOM.render(<Playground endpoint="https://api.graph.cool/simple/v1/swapi" />, document.body)
```

#### `<Playground />` Props
```ts
interface PlaygroundProps {
  endpoint?: string // endpoint url (e.g. https://api.graph.cool/simple/v1/swapi)
  subscriptionEndpoint?: string // subscriptions url (e.g. wss://subscriptions.graph.cool/v1/swapi)
  setTitle?: boolean // reflect the current endpoint in the page title
}
```

### As Express Middleware

#### Properties
Express middleware supports the following properties:

+ `options`
  + `endpoint` [`string`] - the GraphQL endpoint url.

#### Usage
```js
import express from 'express'
import { express as playground } from 'graphql-playground/middleware'

const app = express()

app.use('/playground', playground({ endpoint: '/graphql' }))

app.listen(3000)
```

### As Hapi Middleware

#### Properties
Hapi middleware supports the following properties:

+ `options`
  + `path` [`string`] - the Playground middleware url
  + `playgroundOptions`
      + `endpoint` [`string`] - the GraphQL endpoint url.
      + `subscriptionEndpoint` [`string`] - the GraphQL subscription endpoint url.

#### Usage
```js
import hapi from 'hapi'
import { hapi as playground } from 'graphql-playground/middleware'

const server = new Hapi.Server()

server.connection({
  port: 3001
})

server.register({
  register: playground,
  options: {
    path: '/playground',
    endpoint: '/graphql'
  }
},() => server.start())
```

### As Koa Middleware

#### Properties
Koa middleware supports the following properties:

+ `options`
  + `endpoint` [`string`] - the GraphQL endpoint url.
  + `subscriptionEndpoint` [`string`] - the GraphQL subscription endpoint url.

#### Usage
```js
import Koa from 'koa'
import KoaRouter from 'koa-router'
import { koa as playground } from 'graphql-playground/middleware'

const app = new Koa()
const router = new KoaRouter()

router.all('/playground', playground({
  endpoint: '/graphql'
}))

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3001)
```

## Development [![npm version](https://badge.fury.io/js/graphql-playground.svg)](https://badge.fury.io/js/graphql-playground)

This is a mono-repo setup containing packages for the `graphql-playground` and `graphql-playground-electron`.

```sh
$ cd packages/graphql-playground
$ yarn
$ yarn start
```
Open
[localhost:3000](http://localhost:3000/?endpoint=https://api.graph.cool/simple/v1/cj56h35ol3y93018144iab4wo&subscription=wss://subscriptions.graph.cool/v1/cj56h35ol3y93018144iab4wo)


<a name="help-and-community" />

## Help & Community [![Slack Status](https://slack.graph.cool/badge.svg)](https://slack.graph.cool)

Join our [Slack community](http://slack.graph.cool/) if you run into issues or have questions. We love talking to you!

[![](http://i.imgur.com/5RHR6Ku.png)](https://www.graph.cool/)
