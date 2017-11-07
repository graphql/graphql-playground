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
