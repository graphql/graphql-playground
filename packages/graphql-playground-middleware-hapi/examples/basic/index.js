const Hapi = require('@hapi/hapi')
const { ApolloServer, gql } = require('apollo-server-hapi')
const hapiPlayground = require('../../dist').default
const { makeExecutableSchema } = require('graphql-tools')

const HOST = 'localhost'
const PORT = 4000

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

const playground = {
  plugin: hapiPlayground,
  options: {
    path: '/playground',
    endpoint: '/graphql',
  },
}

async function start() {
  console.log(`Setting up server...`)
  try {
    const server = new ApolloServer({ schema })

    const app = new Hapi.server({
      host: HOST,
      port: PORT,
      debug: { request: '*' },
    })
    app.register(playground)

    await server.applyMiddleware({
      app,
    })

    await server.installSubscriptionHandlers(app.listener)

    await app.start()
    console.log(`Server running at: ${app.info.uri}`)
  } catch (err) {
    console.log(`Failed to start server!`, err)
  }
}

start()
