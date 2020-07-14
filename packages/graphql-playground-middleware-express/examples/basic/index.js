const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const expressPlayground = require('../../dist/index').default

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

app.get(
  '/playground',
  expressPlayground({
    endpoint: '/graphql/</script><script>alert(1)</script><script>',
  }),
)
app.listen(PORT)

console.log(
  `Serving the GraphQL Playground on http://localhost:${PORT}/playground`,
)
