const koa = require('koa')
const koaRouter = require('koa-router')
const koaBody = require('koa-bodyparser')
const { graphqlKoa } = require('apollo-server-koa')
const {makeExecutableSchema} = require('graphql-tools')
const koaPlayground = require('graphql-playground-middleware-koa')

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
