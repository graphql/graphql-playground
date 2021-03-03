> **Note:** The primary maintainer @acao is on hiatus until December 2020

> **SECURITY WARNING:** both `graphql-playground-html` and [all four (4) of it's middleware dependents](#impacted-packages) until `graphql-playground-html@1.6.22` were subject to an  **XSS Reflection attack vulnerability only to unsanitized user input strings** to the functions therein. This was resolved in `graphql-playground-html@^1.6.22`. [More Information](#security-details) [CVE-2020-4038](https://github.com/graphql/graphql-playground/security/advisories/GHSA-4852-vrh7-28rf)


<p align="center"><img src="https://imgur.com/5fzMbyV.png" width="269"></p>

[![npm version](https://badge.fury.io/js/graphql-playground-react.svg)](https://badge.fury.io/js/graphql-playground-react)
[![prisma-labs](https://circleci.com/gh/prisma-labs/graphql-playground.svg?style=shield)](https://circleci.com/gh/prisma-labs/graphql-playground)

**Future of this repository**: see [the announcement issue](https://github.com/prisma-labs/graphql-playground/issues/1143) for details.

---

GraphQL IDE for better development workflows (GraphQL Subscriptions, interactive docs & collaboration). <br />

[![](https://i.imgur.com/AE5W6OW.png)](https://graphqlbin.com/v2/6RQ6TM)

## Installation

```sh
$ brew install --cask graphql-playground
```

## Features

- ✨ Context-aware autocompletion & error highlighting
- 📚 Interactive, multi-column docs (keyboard support)
- ⚡️ Supports real-time GraphQL Subscriptions
- ⚙ GraphQL Config support with multiple Projects & Endpoints
- 🚥 Apollo Tracing support

## Security Details
> **NOTE: only _unsanitized user input_ to the functions in these packages is vulnerable** to the recently reported XSS Reflection attack.

### Impact

> Impacted are any and all unsanitized **user-defined** input to:
-`renderPlaygroundPage()`
-`koaPlayground()`
-`expressPlayground()`
-`koaPlayground()`
-`lambdaPlayground()

>  If you used static values, such as `graphql-playground-electron` does in [it's webpack config](https://github.com/prisma-labs/graphql-playground/blob/master/packages/graphql-playground-electron/webpack.config.build.js#L16), as well as the most common middleware implementations out there, they were not vulnerable to the attack.

The only reason this vulnerability exists is because we are using template strings in `renderPlaygroundPage()` with potentially unsanitized user defined variables. This allows an attacker to inject html and javascript into the page. 
- [Read more about preventing XSS in react](https://pragmaticwebsecurity.com/files/cheatsheets/reactxss.pdf)

Common examples may be user-defined path parameters, query string, unsanitized UI provided values in database, etc., that are used to build template strings or passed directly to a `renderPlaygroundPage()` or the matching middleware function equivalent listed above.

### Impacted Packages

**All versions of these packages are impacted until the ones specified below**, which are now safe for user defined input:

- `graphql-playground-html`: **☔ safe** @ `1.6.22`
- `graphql-playground-express` **☔ safe** @ `1.7.16`
- `graphql-playground-koa` **☔ safe** @ `1.6.15`
- `graphql-playground-hapi` **☔ safe** @ `1.6.13`
- `graphql-playground-lambda` **☔ safe** @ `1.7.17`
- `graphql-playground-electron` has always been **☔ safe** from XSS attacks! This is because configuration is statically defined [it's webpack config](https://github.com/prisma-labs/graphql-playground/blob/master/packages/graphql-playground-electron/webpack.config.build.js#L16)
- `graphql-playground-react` is safe because it does not use `renderPlaygroundPage()` anywhere, and thus is not susceptible to template string XSS reflection attacks.

### More Information

See the [security docs](./SECURITY.md) for more details on how your implementation might be impacted by this vulnerability. It contains safe examples, unsafe examples, workarounds, and more details.

We've also provided ['an example of the xss using the express middleware]('https://github.com/prisma-labs/graphql-playground/tree/master/packages/graphql-playground-html/examples/xss-attack')

## FAQ

### How is this different from [GraphiQL](https://github.com/graphql/graphiql)?

GraphQL Playground uses components of GraphiQL under the hood but is meant as a more powerful GraphQL IDE enabling better (local) development workflows. Compared to GraphiQL, the GraphQL Playground ships with the following additional features:

- Interactive, multi-column schema documentation
- Automatic schema reloading
- Support for GraphQL Subscriptions
- Query history
- Configuration of HTTP headers
- Tabs

See the following question for more additonal features.

### What's the difference between the desktop app and the web version?

The desktop app is the same as the web version but includes these additional features:

- Partial support for [graphql-config](https://github.com/prismagraphql/graphql-config) enabling features like multi-environment setups (no support for sending HTTP headers).
- Double click on `*.graphql` files.

### How does GraphQL Bin work?

You can easily share your Playgrounds with others by clicking on the "Share" button and sharing the generated link. You can think about GraphQL Bin like Pastebin for your GraphQL queries including the context (endpoint, HTTP headers, open tabs etc).

<a href="https://graphqlbin.com/OksD" target="_blank">
 <img src="https://camo.githubusercontent.com/daf8c64dbde3097fdbe782c0645552550d530a73/68747470733a2f2f696d6775722e636f6d2f48316e36346c4c2e706e67" alt="" data-canonical-src="https://imgur.com/H1n64lL.png" style="max-width:100%;">
</a>

> You can also find the announcement blog post [here](https://blog.graph.cool/introducing-graphql-playground-f1e0a018f05d).

## Settings

In the top right corner of the Playground window you can click on the settings icon.
These are the settings currently available:

```js
{
  'editor.cursorShape': 'line', // possible values: 'line', 'block', 'underline'
  'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
  'editor.fontSize': 14,
  'editor.reuseHeaders': true, // new tab reuses headers from last tab
  'editor.theme': 'dark', // possible values: 'dark', 'light'
  'general.betaUpdates': false,
  'prettier.printWidth': 80,
  'prettier.tabWidth': 2,
  'prettier.useTabs': false,
  'request.credentials': 'omit', // possible values: 'omit', 'include', 'same-origin'
  'schema.polling.enable': true, // enables automatic schema polling
  'schema.polling.endpointFilter': '*localhost*', // endpoint filter for schema polling
  'schema.polling.interval': 2000, // schema polling interval in ms
  'schema.disableComments': boolean,
  'tracing.hideTracingResponse': true,
  'tracing.tracingSupported': true, // set false to remove x-apollo-tracing header from Schema fetch requests
}
```

## Usage

### Properties

The React component `<Playground />` and all middlewares expose the following options:

- `props` (Middlewares & React Component)
  - `endpoint` [`string`](optional) - the GraphQL endpoint url.
  - `subscriptionEndpoint` [`string`](optional) - the GraphQL subscriptions endpoint url.
  - `workspaceName` [`string`](optional) - in case you provide a GraphQL Config, you can name your workspace here
  - `config` [`string`](optional) - the JSON of a GraphQL Config. See an example [here](https://github.com/prismagraphql/graphql-playground/blob/master/packages/graphql-playground-react/src/localDevIndex.tsx#L47)
  - `settings` [`ISettings`](optional) - Editor settings in json format as [described here](https://github.com/prismagraphql/graphql-playground#settings)

```ts
interface ISettings {
  'editor.cursorShape': 'line' | 'block' | 'underline'
  'editor.fontFamily': string
  'editor.fontSize': number
  'editor.reuseHeaders': boolean
  'editor.theme': 'dark' | 'light'
  'general.betaUpdates': boolean
  'prettier.printWidth': number
  'prettier.tabWidth': number
  'prettier.useTabs': boolean
  'request.credentials': 'omit' | 'include' | 'same-origin'
  'request.globalHeaders': { [key: string]: string }
  'schema.polling.enable': boolean
  'schema.polling.endpointFilter': string
  'schema.polling.interval': number
  'schema.disableComments': boolean
  'tracing.hideTracingResponse': boolean
  'tracing.tracingSupported': boolean
}
```

- `schema` [`IntrospectionResult`](optional) - The result of an introspection query (an object of this form: `{__schema: {...}}`) The playground automatically fetches the schema from the endpoint. This is only needed when you want to override the schema.
- `tabs` [`Tab[]`](optional) - An array of tabs to inject. **Note: When using this feature, tabs will be resetted each time the page is reloaded**

```ts
interface Tab {
  endpoint: string
  query: string
  name?: string
  variables?: string
  responses?: string[]
  headers?: { [key: string]: string }
}
```

In addition to this, the React app provides some more properties:

- `props` (React Component)
- `createApolloLink` [`(session: Session, subscriptionEndpoint?: string) => ApolloLink`] - this is the equivalent to the `fetcher` of GraphiQL. For each query that is being executed, this function will be called

`createApolloLink` is only available in the React Component and not the middlewares, because the content must be serializable as it is being printed into a HTML template.

### As HTML Page

If you simply want to render the Playground HTML on your own, for example when implementing a GraphQL Server, there are 2 options for you:

1.  [The bare minimum HTML needed to render the Playground](https://github.com/prismagraphql/graphql-playground/blob/master/packages/graphql-playground-html/minimal.html)
2.  [The Playground HTML with full loading animation](https://github.com/prismagraphql/graphql-playground/blob/master/packages/graphql-playground-html/withAnimation.html)

Note: In case you do not want to serve assets from a CDN (like jsDelivr) and instead use a local copy, you will need to install `graphql-playground-react` from npm, and then replace all instances of `//cdn.jsdelivr.net/npm` with `./node_modules`. An example can be found [here](https://github.com/prismagraphql/graphql-playground/blob/master/packages/graphql-playground-html/minimalWithoutCDN.html)

### As React Component

#### Install

```sh
yarn add graphql-playground-react
```

#### Use

GraphQL Playground provides a React component responsible for rendering the UI and Session management.
There are **3 dependencies** needed in order to run the `graphql-playground-react` React component.

1.  _Open Sans_ and _Source Code Pro_ fonts
2.  Rendering the `<Playground />` component

The GraphQL Playground requires **React 16**.

Including Fonts (`1.`)

```html
<link
  href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700|Source+Code+Pro:400,700"
  rel="stylesheet"
/>
```

Including stylesheet and the component (`2., 3.`)

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Playground, store } from 'graphql-playground-react'

ReactDOM.render(
  <Provider store={store}>
    <Playground endpoint='https://api.graph.cool/simple/v1/swapi' />
  </Provider>,
  document.body,
)
```

### As Server Middleware

#### Install

```sh
# Pick the one that matches your server framework
yarn add graphql-playground-middleware-express  # for Express or Connect
yarn add graphql-playground-middleware-hapi
yarn add graphql-playground-middleware-koa
yarn add graphql-playground-middleware-lambda
```

#### Usage with example

We have a full example for each of the frameworks below:

- **Express:** See [packages/graphql-playground-middleware-express/examples/basic](https://github.com/prismagraphql/graphql-playground/tree/master/packages/graphql-playground-middleware-express/examples/basic)

- **Hapi:** See [packages/graphql-playground-middleware-hapi](https://github.com/prismagraphql/graphql-playground/tree/master/packages/graphql-playground-middleware-hapi)

- **Koa:** See [packages/graphql-playground-middleware-koa](https://github.com/prismagraphql/graphql-playground/tree/master/packages/graphql-playground-middleware-koa)

- **Lambda (as serverless handler):** See [serverless-graphql-apollo](https://github.com/serverless/serverless-graphql-apollo) or a quick example below.

### As serverless handler

#### Install

```sh
yarn add graphql-playground-middleware-lambda
```

#### Usage

`handler.js`

```js
import lambdaPlayground from 'graphql-playground-middleware-lambda'
// or using require()
// const lambdaPlayground = require('graphql-playground-middleware-lambda').default

exports.graphqlHandler = function graphqlHandler(event, context, callback) {
  function callbackFilter(error, output) {
    // eslint-disable-next-line no-param-reassign
    output.headers['Access-Control-Allow-Origin'] = '*'
    callback(error, output)
  }

  const handler = graphqlLambda({ schema: myGraphQLSchema })
  return handler(event, context, callbackFilter)
}

exports.playgroundHandler = lambdaPlayground({
  endpoint: '/dev/graphql',
})
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

#### Security Issue

There is an [XSS Reflection Vulnerability](./SECURITY.md) when using these middlewares with unsanitized user input before

## Development

```sh
$ cd packages/graphql-playground-react
$ yarn
$ yarn start
```

Open
[localhost:3000/localDev.html?endpoint=https://api.graph.cool/simple/v1/swapi](http://localhost:3000/localDev.html?endpoint=https://api.graph.cool/simple/v1/swapi) for local development!

### Contributing to this project

TThis repository is managed by EasyCLA. Project participants must sign the free ([GraphQL Specification Membership agreement](https://preview-spec-membership.graphql.org) before making a contribution. You only need to do this one time, and it can be signed by [individual contributors](http://individual-spec-membership.graphql.org/) or their [employers](http://corporate-spec-membership.graphql.org/).

To initiate the signature process please open a PR against this repo. The EasyCLA bot will block the merge if we still need a membership agreement from you.

You can find [detailed information here](https://github.com/graphql/graphql-wg/tree/main/membership). If you have issues, please email [operations@graphql.org](mailto:operations@graphql.org).

If your company benefits from GraphQL and you would like to provide essential financial support for the systems and people that power our community, please also consider membership in the [GraphQL Foundation](https://foundation.graphql.org/join).

## Custom Theme

From `graphql-playground-react@1.7.0` on you can provide a `codeTheme` property to the React Component to customize your color theme.
These are the available options:

```ts
export interface EditorColours {
  property: string
  comment: string
  punctuation: string
  keyword: string
  def: string
  qualifier: string
  attribute: string
  number: string
  string: string
  builtin: string
  string2: string
  variable: string
  meta: string
  atom: string
  ws: string
  selection: string
  cursorColor: string
  editorBackground: string
  resultBackground: string
  leftDrawerBackground: string
  rightDrawerBackground: string
}
```

### Versions

This is repository is a "mono repo" and contains multiple packages using [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/). Please be aware that versions are **not** synchronised between packages. The versions of the [release page](https://github.com/graphcool/graphql-playground/releases) refer to the electron app.

### Packages

In the folder `packages` you'll find the following packages:

- `graphql-playground-electron`: Cross-platform electron app which uses `graphql-playground-react`
- `graphql-playground-html`: Simple HTML page rendering a version of `graphql-playground-react` hosted on JSDeliver
- `graphql-playground-middleware-express`: Express middleware using `graphql-playground-html`
- `graphql-playground-middleware-hapi`: Hapi middleware using `graphql-playground-html`
- `graphql-playground-middleware-koa`: Koa middleware using `graphql-playground-html`
- `graphql-playground-middleware-lambda`: AWS Lambda middleware using `graphql-playground-html`
- `graphql-playground-react`: Core of GraphQL Playground built with ReactJS

<a name="help-and-community" />

## Help & Community [![Discord](https://img.shields.io/discord/586999333447270440.svg)](https://discord.gg/EXUYPaY)

Join our [Discord Server](https://discord.gg/EXUYPaY) if you run into issues or have questions. We love talking to you!

<p align="center"><a href="https://oss.prisma.io"><img src="https://imgur.com/IMU2ERq.png" alt="Prisma" height="170px"></a></p>
