const express = require("express");
const { gql, ApolloServer } = require("apollo-server-express");
const expressPlayground = require("../../dist/index").default;

const typeDefs = gql`
  type Query {
    hello: String!
  }
  schema {
    query: Query
  }
`;
const resolvers = {
  Query: {
    hello: () => "world"
  }
};
const PORT = 4001;

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();
server.applyMiddleware({ app });

app.get(
  "/playground",
  expressPlayground({
    endpoint: "/graphql",
    env: process.env,
    useGraphQLConfig: true
  })
);

app.listen(PORT);

console.log(
  `Serving the GraphQL Playground on http://localhost:${PORT}/playground`
);
