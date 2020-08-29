const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const { filterXSS } = require('xss')
const { renderPlaygroundPage } = require('graphql-playground-html')

const typeDefs = gql`
  type Query {
    hello: String!
  }
  schema {
    query: Query
  }
`
const resolvers = {
  Query: {
    hello: () => 'world',
  },
}

const PORT = 4000

const server = new ApolloServer({ typeDefs, resolvers })

const app = express()
server.applyMiddleware({ app })

// Example 1: Query Parameters

app.get('/example-1', (req, res, next) => {
  res.write(
    renderPlaygroundPage({
      endpoint: `/graphql/${req.query.id}`,
    }),
  )
  res.status(200)
  next()
})

// Example 2: mock database example

const db = {
  async get() {
    return {
      'editor.fontFamily': `</script><script>alert('I <3 GraphQL. Hack the Planet!!')</script><script>`,
    }
  },
}

app.get('/example-2', async (req, res, next) => {
  const settings = await db.get()
  res.write(
    renderPlaygroundPage({
      endpoint: '/graphql',
      settings,
    }),
  )
  next()
})

// Example 3: Manual Workaround

const filter = (val) => {
  return filterXSS(val, {
    // @ts-ignore
    whiteList: [],
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  })
}

app.get('/example-3', (req, res, next) => {
  res.write(
    renderPlaygroundPage({
      endpoint: `/graphql/${filter(req.query.id)}`,
    }),
  )
  res.status(200)
  next()
})

// Example 4: Safe

app.get('/example-4', (req, res, next) => {
  res.write(
    renderPlaygroundPage({
      endpoint: `/graphql`,
      settings: {
        'editor.theme': req.query.darkMode ? 'dark' : 'light',
      },
    }),
  )
  res.status(200)
  next()
})

app.listen(PORT)

console.log(
  `Serving the GraphQL Playground on http://localhost:${PORT}/example-2`,
)
