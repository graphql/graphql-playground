const gql = require('graphql-tag')
const koa = require('koa')
const koaRouter = require('koa-router')
const koaBody = require('koa-bodyparser')
const { ApolloServer } = require('apollo-server-koa')
const { makeExecutableSchema } = require('graphql-tools')
const koaPlayground = require('../../dist/index').default

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

const app = new koa()
const router = new koaRouter()
const PORT = 4000
const schema = makeExecutableSchema({ typeDefs, resolvers })
const graphql = new ApolloServer({ schema });
graphql.applyMiddleware({ app });

// koaBody is needed just for POST.
app.use(koaBody())

router.all(
  '/playground',
  koaPlayground({
    endpoint: '/graphql',
  }),
)

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(PORT)

console.log(
  `Serving the GraphQL Playground on http://localhost:${PORT}/playground`,
)
