const hapi = require('hapi')
const {graphqlHapi} = require('apollo-server-hapi')
const {hapiPlayground} = require('graphql-playground-middleware')
const {makeExecutableSchema} = require('graphql-tools')

const server = new hapi.Server({ debug: { request: "*" } });

const HOST = 'localhost';
const PORT = 4000;

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

server.connection({
  host: HOST,
  port: PORT,
});

server.register({
  register: graphqlHapi,
  options: {
    path: '/graphql',
    graphqlOptions: {
      schema,
    },
    route: {
      cors: true
    }
  },
});

server.register({
  register: hapiPlayground,
  options: {
    path: '/playground',
    endpoint: '/graphql'
  }
})

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log(`Server running at: ${server.info.uri}`);
});