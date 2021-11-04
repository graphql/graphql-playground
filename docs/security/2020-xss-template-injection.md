## XSS Reflection Vulnerability

the origin of the vulnerability is in `renderPlaygroundPage`, found in `graphql-playground-html`

### Impact

When using

- `renderPlaygroundPage()`,
- `koaPlayground()`
- `expressPlayground()`
- `koaPlayground()`
- `lambdaPlayground()`
- any downstream dependent packages that use these functions

without sanitization of user input, your application is vulnerable to an XSS Reflection Attack. This is a serious vulnerability that could allow for exfiltration of data or user credentials, or to disrupt systems.

We've provided ['an example of the xss using the express middleware]('https://github.com/prisma-labs/graphql-playground/tree/main/packages/graphql-playground-middleware-express/examples/xss-attack')

### Impacted Packages

**All versions of these packages are impacted until those specified below**, which are now safe for user defined input:

- `graphql-playground-html`: **☔ safe** @ `1.6.22`
- `graphql-playground-express` **☔ safe** @ `1.7.16`
- `graphql-playground-koa` **☔ safe** @ `1.6.15`
- `graphql-playground-hapi` **☔ safe** @ `1.6.13`
- `graphql-playground-lambda` **☔ safe** @ `1.7.17`

### Static input was always safe

These examples are safe for _all versions_ **because input is static**

with `express` and `renderPlaygroundPage`:

```js
app.get('/playground', (req) => {
  res.html(
    renderPlaygroundPage({
      endpoint: `/our/graphql`,
    }),
  )
  next()
})
```

with `expressPlayground`:

```js
// params
app.get('/playground', (req) =>
  expressPlayground({
    endpoint: `/our/graphql`,
    settings: { 'editor.theme': req.query.darkMode ? 'dark' : 'light' },
  }),
)
```

with `koaPlayground`:

```js
const koa = require('koa')
const koaRouter = require('koa-router')
const koaPlayground = require('graphql-playground-middleware-koa')

const app = new koa()
const router = new koaRouter()

router.all('/playground', koaPlayground({ endpoint: '/graphql' }))
```

### Vulnerable Examples

Here are some examples where the vulnerability would be present before the patch, because of unfiltered user input

```js
const express = require('express')
const expressPlayground = require('graphql-playground-middleware-express')
  .default

const app = express()

app.use(express.json())

// params
app.get('/playground/:id', (req) =>
  expressPlayground({
    endpoint: `/our/graphql/${req.params.id}`,
  }),
)

// params
app.get('/playground', (req) =>
  expressPlayground({
    endpoint: `/our/graphql`,
    // any settings that are unsanitized user input, not just `endpoint`
    settings: { 'editor.fontFamily': req.query.font },
  }),
)
```

[See a proof of concept](packages/graphql-playground-html/examples/xss-attack) to understand the vulnerability better

### Workaround

To fix this issue without the update, you can sanitize however you want.

We suggest using [`xss`](https://www.npmjs.com/package/xss) (what we use for our own fix)

For example, with `graphql-playground-middleware-express`:

```js
const express = require('express')
const { filterXSS } = require('xss')
const expressPlayground = require('graphql-playground-middleware-express')
  .default


const app = express()

const filter = (val) => filterXSS(val, {
  whitelist: [],
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script']
})

// simple example
app.get('/playground/:id', (req) =>
  expressPlayground({ endpoint: `/graphql/${filter(req.params.id)}` })

// advanced params
app.get('/playground', (req) =>
  expressPlayground(JSON.parse(filter(JSON.stringify(req.query))))
```

[See a proof of concept workaround](packages/graphql-playground-html/examples/xss-attack), example #3
