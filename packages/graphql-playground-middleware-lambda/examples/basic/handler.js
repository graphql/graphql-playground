// or using require()
const {makeExecutableSchema} = require('graphql-tools')
const lambdaPlayground = require('../../dist/index').default
const {graphqlLambda} = require('apollo-server-lambda')

const typeDefs = `
type Post {
  id: ID!
  title: String
}

type Query {
  posts: [Post]
}
schema {
  query: Query
}
`;

const resolvers = {
  Query: {
    posts() {
      return [{id: "1", title: "Awesome Post"}];
    },
  },
};

exports.graphqlHandler = function graphqlHandler(event, context, callback) {
  function callbackFilter(error, output) {
    // eslint-disable-next-line no-param-reassign
    output.headers['Access-Control-Allow-Origin'] = '*';
    callback(error, output);
  }

  const myGraphQLSchema = makeExecutableSchema({typeDefs, resolvers})

  const handler = graphqlLambda({ schema: myGraphQLSchema });
  return handler(event, context, callbackFilter);
};

exports.playgroundHandler = lambdaPlayground({
  endpoint: '/dev/graphql',
});
