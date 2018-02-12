const hapi = require('hapi')
const { graphqlHapi } = require('apollo-server-hapi')
const hapiPlayground = require('../../dist').default
const { makeExecutableSchema } = require('graphql-tools')

const HOST = 'localhost'
const PORT = 4000

const server = new hapi.Server({
  host: HOST,
  port: PORT,
  debug: { request: '*' }
})

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

const api = {
  plugin: graphqlHapi,
  options: {
    path: '/graphql',
    graphqlOptions: {
      schema,
    },
    route: {
      cors: true,
    },
  },
}

const playground = {
  plugin: hapiPlayground,
  options: {
    path: '/playground',
    endpoint: '/graphql',
  },
}

const plugins = [
  api,
  playground,
]

async function start() {
  console.log(`Setting up server...`)
  try {
    await server.register(plugins)
    await server.start()
    console.log(`Server running at: ${server.info.uri}`)
  } catch (err) {
    console.log(`Failed to start server!`, err)
  }
}

start()
