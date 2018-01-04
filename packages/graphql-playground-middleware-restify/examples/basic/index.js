const restify = require('restify');
const bodyParser = require('body-parser')
const { graphqlRestify } = require('apollo-server-restify')
const { makeExecutableSchema } = require('graphql-tools')
const restifyPlayground = require('../../dist/index').default

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

var server = restify.createServer()
server.use(restify.plugins.bodyParser());
server.get('/graphql', graphqlRestify({ schema }))
server.post('/graphql', graphqlRestify({ schema }))
server.get('/playground', restifyPlayground({ endpoint: '/graphql' }))

server.listen(PORT, function() {
  console.log(
    `Serving the GraphQL Playground on http://localhost:${PORT}/playground`)
})


